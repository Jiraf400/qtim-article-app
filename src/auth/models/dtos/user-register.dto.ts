import { IsEmail, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
