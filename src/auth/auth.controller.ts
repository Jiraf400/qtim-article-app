import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './models/dtos/user-register.dto';
import { ValidationUtils } from '../utils/ValidationUtils';
import { UserLoginDto } from './models/dtos/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerNewUser(@Res() res: Response, @Body() user: UserRegisterDto) {
    if (!ValidationUtils.isEmailValid(user.email)) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const createdUser = await this.authService.register(user);

    return res.status(201).json({
      status: 'OK',
      message: 'Successfully register new user',
      body: createdUser,
    });
  }

  @Post('login')
  async loginUser(@Res() res: Response, @Body() user: UserLoginDto) {
    const { email, password } = user;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const accessToken = await this.authService.login(email, password);

    res.status(200).json(accessToken);
  }
}
