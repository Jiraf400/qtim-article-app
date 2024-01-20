import { HttpException, Injectable } from '@nestjs/common';
import { ArticleDto } from './models/article.dto';
import { Article } from './models/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/models/user.entity';
import { Between, Repository } from 'typeorm';
import { ArticleModel } from './models/article.model';
import { ArticleMapper } from './mappers/article.mapper';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private mapper: ArticleMapper,
    private redisClient: RedisService,
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

    await this.resetRedisCache(null, user_id, saved.publishedAt);

    await this.redisClient.setValueToCache(
      `${saved.id}`,
      JSON.stringify(article),
    );

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

    await this.articleRepository.update(id, {
      name: articleDto.name,
      description: articleDto.description,
    });

    const updated = await this.articleRepository.findOneBy({ id });

    await this.resetRedisCache(id, user_id, updated.publishedAt);

    await this.redisClient.setValueToCache(`${id}`, JSON.stringify(article));

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

    await this.resetRedisCache(id, user_id, article.publishedAt);

    console.log(`Article deleted with id: ${article.id}`);

    return article.id;
  }

  async getArticleById(id: number) {
    let article: any = await this.redisClient.getValueFromCache(`${id}`);

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

    await this.redisClient.setValueToCache(`${id}`, JSON.stringify(article));

    return this.mapper.mapArticleToModel(article);
  }

  async getArticlesByAuthorId(user_id: number, { page = 1, limit = 10 }) {
    let articles: any = await this.redisClient.getValueFromCache(
      `cached multiple articles key for author: ${user_id}`,
    );

    articles = JSON.parse(articles);

    if (!articles || page !== 1 || limit !== 10) {
      console.log(`Article for user ${user_id} not found in cache`);
      const skip = (page - 1) * limit;

      const user = await this.userRepository.findOneBy({ id: user_id });

      if (!user) {
        throw new HttpException('User not found', 400);
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

    await this.redisClient.setValueToCache(
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
    let articles: any = await this.redisClient.getValueFromCache(
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

    await this.redisClient.setValueToCache(
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

  async resetRedisCache(id: number, user_id: number, publishedDate: Date) {
    await this.redisClient.deleteValueFromCache(`${id}`);

    await this.redisClient.deleteValueFromCache(
      `cached multiple articles key for author: ${user_id}`,
    );

    await this.redisClient.deleteValueFromCache(
      `cached multiple articles key for date: ${this.mapper.mapDateToDDMMYYYY(publishedDate)}`,
    );
  }
}
