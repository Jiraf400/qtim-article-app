import { HttpException, Injectable } from '@nestjs/common';
import { ArticleDto } from './models/article.dto';
import { Article } from './models/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async createNewArticle(dto: ArticleDto, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new HttpException('No user found', 400);
    }

    const article = mapDtoToArticle(dto, user);

    const saved = await this.articleRepository.save(article);

    console.log(`Article created with id: ${saved.id}`);

    return saved;
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

    if (!article) {
      throw new HttpException('No article found', 400);
    }

    if (article.user.id !== user.id) {
      throw new HttpException('Access not allowed', 401);
    }

    await this.articleRepository.delete(article);

    console.log(`Article deleted with id: ${article.id}`);

    return article.id;
  }

  async getArticleById(id: number) {}

  async getArticlesByAuthorId(authorId: number) {
    return [];
  }

  async getArticlesByDate(date: string) {
    return [];
  }
}

function mapDtoToArticle(articleDto: ArticleDto, user: User): Article {
  const article = new Article();
  article.name = articleDto.name;
  article.description = articleDto.description;
  article.publishedAt = new Date();
  article.user = user;

  return article;
}
