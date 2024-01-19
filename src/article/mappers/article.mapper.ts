import { Injectable } from '@nestjs/common';
import { ArticleDto } from '../models/article.dto';
import { User } from '../../auth/models/user.entity';
import { Article } from '../models/article.entity';
import { ArticleModel } from '../models/article.model';

@Injectable()
export class ArticleMapper {
  mapDtoToArticle(articleDto: ArticleDto, user: User): Article {
    const article = new Article();

    article.name = articleDto.name;
    article.description = articleDto.description;
    article.publishedAt = new Date();
    article.user = user;

    return article;
  }

  mapArticleToModel(article: Article): ArticleModel {
    const model = new ArticleModel();

    model.id = article.id;
    model.name = article.name;
    model.description = article.description;
    model.publishedAt = article.publishedAt;
    model.authorId = article.user.id;

    return model;
  }

  mapDateToDateTimeObjects(dateFromUrl: string) {
    const date = this.mapDDMMYYYYToDateObject(dateFromUrl);

    const startOfTime: Date = new Date(date);
    const endOfTime: Date = new Date(date);

    startOfTime.setHours(0, 0, 0, 0);
    endOfTime.setHours(23, 59, 59, 999);

    return { startOfTime, endOfTime };
  }

  private mapDDMMYYYYToDateObject(date: string) {
    const dateParts: string[] = date.split('-');

    const dateObject = new Date(
      +dateParts[2],
      parseInt(dateParts[1]) - 1,
      +dateParts[0],
    );

    return dateObject;
  }
}
