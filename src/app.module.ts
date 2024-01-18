import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import * as dotenv from 'dotenv';
import { User } from './auth/user/user.entity';

dotenv.config();

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: `${process.env.POSTGRES_URL}`,
      autoLoadEntities: true,
      synchronize: true,
      entities: [User],
    }),
  ],
})
export class AppModule {}
