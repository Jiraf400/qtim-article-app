import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/auth/user/user.entity';
import * as process from 'process';

config();

export default new DataSource({
  type: 'postgres',
  url: `${process.env.POSTGRES_URL}`,
  migrations: ['migrations/**'],
  entities: [User],
});
