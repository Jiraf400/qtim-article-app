import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/models/user.entity';

@Entity({ name: 'articles' })
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.articles, {
    cascade: true,
  })
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;
}
