import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './models/user.entity';
import { Response } from 'express';
import { UserRegisterDto } from './models/dtos/user-register.dto';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserLoginDto } from './models/dtos/user-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerNewUser', () => {
    it('should return a successful register response', async () => {
      const createdUser: User = {
        id: 1,
        name: 'John',
        email: 'john@mail.com',
        password: 'pass1234',
        articles: [],
      };

      const userDto: UserRegisterDto = {
        name: 'John',
        email: 'john@mail.com',
        password: 'pass1234',
      };

      jest.spyOn(service, 'register').mockResolvedValue(createdUser);

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.registerNewUser(mockResponse, userDto);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          message: 'Successfully register new user',
          body: createdUser,
        }),
      );
    });
    it('should return 400 if email is invalid', async () => {
      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      const userDto: UserRegisterDto = {
        name: 'John',
        email: 'john@.@mail.com',
        password: 'pass1234',
      };

      await controller.registerNewUser(mockResponse, userDto);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'All fields must be filled.',
        }),
      );
    });
  });

  describe('loginUser()', () => {
    it('should return a successful login response', async () => {
      const access_token = 'token123';

      const userDto: UserLoginDto = {
        email: 'john@mail.com',
        password: 'pass1234',
      };

      jest
        .spyOn(service, 'login')
        .mockImplementationOnce(async () => ({ access_token: access_token }));

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.loginUser(mockResponse, userDto);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        access_token: access_token,
      });
    });
    it('should return 400 if email or password is undefined', async () => {
      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      const userDto = {
        name: 'John',
      } as UserRegisterDto;

      await controller.loginUser(mockResponse, userDto);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'All fields must be filled.',
        }),
      );
    });
  });
});
