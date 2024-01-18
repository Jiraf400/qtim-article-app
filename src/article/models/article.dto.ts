import { Length } from 'class-validator';

export class ArticleDto {
  @Length(4, 26)
  name: string;
  @Length(24, 32767)
  description: string;
}
