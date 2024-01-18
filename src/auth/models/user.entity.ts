import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Article } from '../../article/models/article.entity';

@Entity({ name: 'users' })
export class User {
  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Article, (article) => article.user)
  articles: Article[];
}
