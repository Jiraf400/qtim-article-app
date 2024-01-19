import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as process from 'process';
import { User } from './models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './models/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(data: UserDto) {
    const duplicate = await this.userRepository.findOneBy({
      email: data.email,
    });

    if (duplicate) {
      throw new HttpException('User already exists', 400);
    }

    data.password = await bcrypt.hash(data.password, 8);

    const created = await this.userRepository.save(data);

    console.log(`Create user ${created.id}`);

    return created;
  }

  async login(email: any, password: any) {
    const candidate = await this.userRepository.findOneBy({ email });

    if (!candidate) {
      throw new HttpException('User not exists', 400);
    }

    const match = await bcrypt.compare(password, candidate.password);

    if (!match) {
      throw new HttpException('Failed to match credentials', 400);
    }

    console.log(`Create token for user ${email}`);

    const accessToken = await this.generateJwtToken(email, candidate.id);

    return {
      access_token: accessToken,
    };
  }

  async generateJwtToken(email: string, candidate_id: number) {
    const payload = { email: email, sub: candidate_id };

    return await this.jwt.signAsync(payload, {
      secret: `${process.env.JWT_SECRET}`,
    });
  }
}
