import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import * as dotenv from 'dotenv';
import { User } from './auth/models/user.entity';
import { ArticleModule } from './article/article.module';
import { Article } from './article/models/article.entity';

dotenv.config();

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: `${process.env.POSTGRES_URL}`,
      autoLoadEntities: true,
      synchronize: false,
      entities: [User, Article],
    }),
    ArticleModule,
  ],
})
export class AppModule {}
