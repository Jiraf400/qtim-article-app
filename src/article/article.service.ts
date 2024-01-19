import { HttpException, Injectable } from '@nestjs/common';
import { ArticleDto } from './models/article.dto';
import { Article } from './models/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/models/user.entity';
import { Between, Repository } from 'typeorm';
import { ArticleModel } from './models/article.model';
import { ArticleMapper } from './mappers/article.mapper';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private mapper: ArticleMapper,
  ) {}

  async createNewArticle(dto: ArticleDto, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new HttpException('No user found', 400);
    }

    const article = this.mapper.mapDtoToArticle(dto, user);

    const saved = await this.articleRepository.save(article);

    const savedModel = this.mapper.mapArticleToModel(saved);

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

    console.log(`Article deleted with id: ${article.id}`);

    return article.id;
  }

  async getArticleById(id: number) {
    const article = await this.articleRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
      },
    });

    if (!article) {
      throw new HttpException('Article not found', 400);
    }

    return this.mapper.mapArticleToModel(article);
  }

  async getArticlesByAuthorId(user_id: number) {
    const user = await this.userRepository.findOneBy({ id: user_id });

    if (!user) {
      throw new HttpException('Author not found', 400);
    }

    const articles = await this.articleRepository.find({
      relations: {
        user: true,
      },
      where: {
        user: {
          id: user_id,
        },
      },
    });

    const models: ArticleModel[] = [];

    for (const article of articles) {
      const model = this.mapper.mapArticleToModel(article);
      models.push(model);
    }

    return models;
  }

  async getArticlesByDate(date: string) {
    const { startOfTime, endOfTime } =
      this.mapper.mapDateToDateTimeObjects(date);

    const articles = await this.articleRepository.find({
      relations: {
        user: true,
      },
      where: {
        publishedAt: Between(
          new Date(startOfTime.toISOString()),
          new Date(endOfTime.toISOString()),
        ),
      },
    });

    const models: ArticleModel[] = [];

    for (const article of articles) {
      const model = this.mapper.mapArticleToModel(article);
      models.push(model);
    }

    return models;
  }
}
