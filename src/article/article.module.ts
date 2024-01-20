import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './models/article.entity';
import { User } from '../auth/models/user.entity';
import { ArticleMapper } from './mappers/article.mapper';
import { RedisService } from '../cache/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Article])],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleMapper, RedisService],
})
export class ArticleModule {}
