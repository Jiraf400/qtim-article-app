import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from './models/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRegisterDto } from './models/dtos/user-register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: 'UserRepository',
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get('UserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register()', () => {
    it('should create user', async () => {
      const userDto: UserRegisterDto = {
        name: 'John',
        password: 'hashedPassword',
        email: 'john@mail.com',
      };

      userRepository.findOneBy = jest.fn().mockResolvedValue(null);
      userRepository.save = jest
        .fn()
        .mockResolvedValue({ id: 1, articles: [], ...userDto });

      const result = await service.register(userDto);

      expect(result.email).toBe('john@mail.com');
      expect(result.password).toBe('hashedPassword');
    });
    it('should throw on duplicate email', async () => {
      try {
        const user: User = {
          id: 1,
          name: 'John',
          password: 'password',
          email: 'john@mail.com',
          articles: [],
        };

        userRepository.findOneBy = jest.fn().mockResolvedValue(user);

        await service.register({} as UserRegisterDto);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('User already exists');
      }
    });
  });

  describe('login()', () => {
    it('should return access token', async () => {
      const user: User = {
        id: 1,
        name: 'John',
        password: 'password',
        email: 'john@mail.com',
        articles: [],
      };

      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValueOnce(true);

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);

      jest.spyOn(service, 'generateJwtToken').mockResolvedValue('token');

      const token = await service.login('john@mail.com', 'password');
      expect(token).not.toBeNull();
      expect(token).toEqual({ access_token: 'token' });
    });
    it('should throw an exception on checking the existence of user', async () => {
      try {
        userRepository.findOneBy = jest.fn().mockResolvedValue(null);
        await service.login('UNKNOWN@gmail.com', 'password1');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('User not exists');
      }
    });
    it('should throw on credentials comparison', async () => {
      try {
        const user: User = {
          id: 1,
          name: 'John',
          password: 'password',
          email: 'john@mail.com',
          articles: [],
        };

        userRepository.findOneBy = jest.fn().mockResolvedValue(user);

        await service.login('john@mail.com', 'anotherPassword');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Failed to match credentials');
      }
    });
  });
});
