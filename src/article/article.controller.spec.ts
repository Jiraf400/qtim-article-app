import { Test } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../auth/models/user.entity';
import { Repository } from 'typeorm';
import { ArticleService } from './article.service';
import { Article } from './models/article.entity';
import { Request, Response } from 'express';
import { ArticleDto } from './models/article.dto';
import { ArticleModel } from './models/article.model';
import { ArticleMapper } from './mappers/article.mapper';
import { ValidationUtils } from '../utils/ValidationUtils';

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: ArticleService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        ArticleService,
        JwtService,
        ArticleMapper,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Article),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    controller = module.get<ArticleController>(ArticleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNewArticle()', () => {
    it('should return created article body', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      const articleDto: ArticleDto = {
        name: 'Article Dto Test Body',
        description: 'Description Of Article Dto Test Body',
      };

      const createdArticle: ArticleModel = {
        id: 1,
        ...articleDto,
        publishedAt: new Date(),
        authorId: 1,
      };

      jest.spyOn(service, 'createNewArticle').mockResolvedValue(createdArticle);

      await controller.createNewArticle(mockRequest, mockResponse, articleDto);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          message: 'Successfully add new article',
          body: createdArticle,
        }),
      );
    });
  });

  describe('getOneArticle()', () => {
    it('should return article body', async () => {
      const articleModel: ArticleModel = {
        id: 1,
        authorId: 1,
        name: 'Article Name',
        description: 'Article Description',
        publishedAt: new Date(),
      };
      jest.spyOn(service, 'getArticleById').mockResolvedValue(articleModel);

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getOneArticle(mockResponse, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          message: 'Success',
          body: articleModel,
        }),
      );
    });
    it('should return 400 if id is incorrect or undefined', async () => {
      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getOneArticle(mockResponse, 'abc' as unknown as number);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Id field required',
      });
    });
  });

  describe('getArticlesByAuthorId()', () => {
    it('should return articles [] by author id', async () => {
      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      const articleModels: ArticleModel[] = [
        {
          id: 1,
          publishedAt: new Date(),
          name: 'name',
          description: 'description',
          authorId: 1,
        },
      ];

      jest
        .spyOn(service, 'getArticlesByAuthorId')
        .mockResolvedValue(articleModels);

      await controller.getArticlesByAuthorId(mockResponse, 1, {
        page: 1,
        limit: 10,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          message: `Articles found: ${articleModels.length}`,
          body: articleModels,
        }),
      );
    });
    it('should return 400 if id is incorrect or undefined', async () => {
      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getArticlesByAuthorId(
        mockResponse,
        'abc' as unknown as number,
        { page: 1, limit: 10 },
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Id field required',
      });
    });
    it('should return 400 if query params is incorrect', async () => {
      jest
        .spyOn(ValidationUtils, 'isValidPaginationParams')
        .mockImplementationOnce(() => false);

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getArticlesByAuthorId(mockResponse, 1, {
        page: -10,
        limit: -10,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Page and limit values should be => 0',
        }),
      );
    });
  });

  describe('getArticlesByDate()', () => {
    it('should return articles [] by date', async () => {
      const articleModels: ArticleModel[] = [
        {
          id: 1,
          publishedAt: new Date(),
          name: 'name',
          description: 'description',
          authorId: 1,
        },
      ];

      jest.spyOn(service, 'getArticlesByDate').mockResolvedValue(articleModels);

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getArticlesByDate(mockResponse, '07-01-2003', {
        page: 1,
        limit: 10,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        page: 1,
        limit: 10,
        body: articleModels,
      });
    });
    it('should return 400 if date format is incorrect', async () => {
      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getArticlesByDate(mockResponse, '', {
        page: 1,
        limit: 10,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid date format (dd-mm-yyyy) or missing date parameter.',
        }),
      );
    });
    it('should return 400 if query params is incorrect', async () => {
      jest
        .spyOn(ValidationUtils, 'isValidPaginationParams')
        .mockImplementationOnce(() => false);

      jest
        .spyOn(ValidationUtils, 'isValidDateFormatDDMMYYYY')
        .mockImplementationOnce(() => true);

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.getArticlesByDate(mockResponse, '01-01-2003', {
        page: -10,
        limit: -10,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Page and limit values should be => 0',
      });
    });
  });

  describe('updateArticle()', () => {
    it('should return updated article body', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      const articleDto: ArticleDto = {
        name: 'Article Dto Test Body',
        description: 'Description Of Article Dto Test Body',
      };

      const updated: Article = {
        id: 1,
        ...articleDto,
        publishedAt: new Date(),
        user: {} as User,
      };

      jest.spyOn(service, 'updateArticle').mockResolvedValue(updated);

      await controller.updateArticle(mockRequest, mockResponse, 1, articleDto);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: 'Success',
        body: updated,
      });
    });
    it('should return 400 if id is incorrect or undefined', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.updateArticle(
        mockRequest,
        mockResponse,
        {} as unknown as number,
        {} as ArticleDto,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Id field required',
      });
    });
  });

  describe('deleteArticle()', () => {
    it('should return 200 and deleted article id', async () => {
      const articleId = 1;

      jest.spyOn(service, 'deleteArticle').mockResolvedValue(articleId);

      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.deleteArticle(mockRequest, mockResponse, articleId);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'OK',
        message: `Article was removed with id: ${articleId}`,
      });
    });
    it('should return 400 if id is incorrect or undefined', async () => {
      const mockRequest = {
        body: {
          user: {
            sub: 1,
          },
        },
      } as Request;

      const mockResponse = {} as unknown as Response;
      mockResponse.json = jest.fn();
      mockResponse.status = jest.fn(() => mockResponse).mockReturnThis();

      await controller.deleteArticle(
        mockRequest,
        mockResponse,
        {} as unknown as number,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Id field required',
      });
    });
  });
});
