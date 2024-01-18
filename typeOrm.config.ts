import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/auth/models/user.entity';
import * as process from 'process';
import { Article } from './src/article/models/article.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: `${process.env.POSTGRES_URL}`,
  migrations: ['migrations/**'],
  entities: [User, Article],
});
