import { HttpException, Injectable } from '@nestjs/common';
import { ArticleDto } from './models/article.dto';
import { Article } from './models/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/models/user.entity';
import { Between, Repository } from 'typeorm';
import { ArticleModel } from './models/article.model';
import { ArticleMapper } from './mappers/article.mapper';
import { client } from '../cache/redis.config';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private mapper: ArticleMapper,
  ) {}

  async createNewArticle(dto: ArticleDto, user_id: number) {
    const user = await this.userRepository.findOneBy({
      id: user_id,
    });

    if (!user) {
      throw new HttpException('No user found', 400);
    }

    const article = this.mapper.mapDtoToArticle(dto, user);

    const saved = await this.articleRepository.save(article);

    const savedModel = this.mapper.mapArticleToModel(saved);

    await client.del(`cached multiple articles key for author: ${user_id}`);
    await client.del(
      `cached multiple articles key for date: ${saved.publishedAt}`,
    );
    await client.set(`${saved.id}`, JSON.stringify(article));

    console.log(`Article created with id: ${saved.id}`);

    return savedModel;
  }

  async updateArticle(id: number, user_id: number, articleDto: ArticleDto) {
    const user = await this.userRepository.findOneBy({ id: user_id });

    if (!user) {
      throw new HttpException('No user found', 400);
    }

    const article = await this.articleRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        user: true,
      },
    });

    if (!article) {
      throw new HttpException('No article found', 400);
    }

    if (article.user.id !== user.id) {
      throw new HttpException('Access not allowed', 401);
    }

    await this.articleRepository
      .createQueryBuilder()
      .update(article)
      .set({ name: articleDto.name, description: articleDto.description })
      .where('id = :id', { id: id })
      .execute();

    const updated = await this.articleRepository.findOneBy({ id });

    await client.del(`${id}`);
    await client.del(`cached multiple articles key for author: ${user_id}`);
    await client.del(
      `cached multiple articles key for date: ${updated.publishedAt}`,
    );
    await client.set(`${id}`, JSON.stringify(article));

    console.log(`Article updated with id: ${updated.id}`);

    return updated;
  }

  async deleteArticle(id: number, user_id: number) {
    const user = await this.userRepository.findOneBy({ id: user_id });

    if (!user) {
      throw new HttpException('No user found', 400);
    }

    const article = await this.articleRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        user: true,
      },
    });

    if (article.user.id !== user.id) {
      throw new HttpException('Access not allowed', 401);
    }

    if (!article) {
      throw new HttpException('No article found', 400);
    }

    await this.articleRepository.delete(article);

    await client.del(`${id}`);
    await client.del(`cached multiple articles key for author: ${user_id}`);
    await client.del(
      `cached multiple articles key for date: ${this.mapper.mapDateToDDMMYYYY(article.publishedAt)}`,
    );

    console.log(`Article deleted with id: ${article.id}`);

    return article.id;
  }

  async getArticleById(id: number) {
    let article: any = await client.get(`${id}`);

    article = JSON.parse(article);

    if (!article) {
      console.log(`Article ${id} not found in cache`);

      article = await this.articleRepository.findOne({
        where: {
          id,
        },
        relations: {
          user: true,
        },
      });
    }
    if (!article) {
      throw new HttpException('Article not found', 400);
    }

    await client.set(`${id}`, JSON.stringify(article));

    return this.mapper.mapArticleToModel(article);
  }

  async getArticlesByAuthorId(user_id: number, { page = 1, limit = 10 }) {
    let articles: any = await client.get(
      `cached multiple articles key for author: ${user_id}`,
    );

    articles = JSON.parse(articles);

    if (!articles || page !== 1 || limit !== 10) {
      console.log(`Article for author ${user_id} not found in cache`);
      const skip = (page - 1) * limit;

      const user = await this.userRepository.findOneBy({ id: user_id });

      if (!user) {
        throw new HttpException('Author not found', 400);
      }

      articles = await this.articleRepository.find({
        relations: {
          user: true,
        },
        where: {
          user: {
            id: user_id,
          },
        },
        skip,
        take: limit,
      });
    }

    await client.set(
      `cached multiple articles key for author: ${user_id}`,
      JSON.stringify(articles),
    );

    const models: ArticleModel[] = [];

    for (const article of articles) {
      const model = this.mapper.mapArticleToModel(article);
      models.push(model);
    }

    return models;
  }

  async getArticlesByDate(date: string, { page = 1, limit = 10 }) {
    let articles: any = await client.get(
      `cached multiple articles key for date: ${date}`,
    );

    articles = JSON.parse(articles);

    if (!articles) {
      console.log(`Article for date ${date} not found in cache`);
      const skip = (page - 1) * limit;

      const { startOfTime, endOfTime } =
        this.mapper.mapDateToDateTimeObjects(date);

      articles = await this.articleRepository.find({
        relations: {
          user: true,
        },
        where: {
          publishedAt: Between(
            new Date(startOfTime.toISOString()),
            new Date(endOfTime.toISOString()),
          ),
        },
        skip,
        take: limit,
      });
    }

    await client.set(
      `cached multiple articles key for date: ${date}`,
      JSON.stringify(articles),
    );

    const models: ArticleModel[] = [];

    for (const article of articles) {
      const model = this.mapper.mapArticleToModel(article);
      models.push(model);
    }

    return models;
  }
}
