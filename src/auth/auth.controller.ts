import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { UserDto } from './models/user.dto';
import { ValidationUtils } from '../utils/ValidationUtils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerNewUser(@Res() res: Response, @Body() user: UserDto) {
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
  async loginUser(@Req() req: Request, @Res() res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields must be filled.' });
    }

    const accessToken = await this.authService.login(email, password);

    res.status(200).json(accessToken);
  }
}
