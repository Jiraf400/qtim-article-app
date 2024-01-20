import { Test } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { JwtService } from '@nestjs/jwt';
import { ArticleMapper } from './mappers/article.mapper';
import { User } from '../auth/models/user.entity';
import { Article } from './models/article.entity';
import { ArticleDto } from './models/article.dto';
import { ArticleModel } from './models/article.model';
import { RedisService } from '../cache/redis.service';

describe('ArticleService', () => {
  let service: ArticleService;
  let userRepository: any;
  let articleRepository: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        ArticleService,
        JwtService,
        ArticleMapper,
        {
          provide: RedisService,
          useValue: {
            doConnect: jest.fn().mockResolvedValue(null),
            getValueFromCache: jest.fn().mockResolvedValue(null),
            setValueToCache: jest.fn().mockResolvedValue(null),
            deleteValueFromCache: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: 'UserRepository',
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'ArticleRepository',
          useValue: {
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<ArticleService>(ArticleService);
    userRepository = moduleRef.get('UserRepository');
    articleRepository = moduleRef.get('ArticleRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewArticle', () => {
    it('should return saved model', async () => {
      const user: User = {
        id: 1,
        name: 'John',
        email: 'john@mail.com',
        password: 'johnpass123',
        articles: [],
      };
      const articleDto: ArticleDto = {
        name: 'name',
        description: 'description',
      };

      const article: Article = {
        id: 1,
        user: user,
        publishedAt: new Date(),
        ...articleDto,
      };

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);
      articleRepository.save = jest.fn().mockResolvedValue(article);

      const result: ArticleModel = await service.createNewArticle(
        articleDto,
        1,
      );

      expect(result.authorId).toBe(1);
      expect(result.description).toBe(articleDto.description);
    });
    it('should throw 400 if user is not found', async () => {
      try {
        userRepository.findOneBy = jest.fn().mockResolvedValue(null);

        await service.createNewArticle({} as ArticleDto, 1);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('No user found');
      }
    });
  });

  describe('updateArticle', () => {
    it('should return updated model', async () => {
      const user: User = {
        id: 1,
        name: 'John',
        email: 'john@mail.com',
        password: 'johnpass123',
        articles: [],
      };

      const articleDto: ArticleDto = {
        name: 'name',
        description: 'description',
      };

      const article: Article = {
        id: 1,
        user: user,
        publishedAt: new Date(),
        ...articleDto,
      };

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);
      articleRepository.findOne = jest.fn().mockResolvedValue(article);
      articleRepository.findOneBy = jest.fn().mockResolvedValue(article);

      const result = await service.updateArticle(1, 1, articleDto);

      expect(result.name).toEqual(article.name);
      expect(result.user).toEqual(user);
    });
    it('should throw 400 if user is not found', async () => {
      try {
        userRepository.findOneBy = jest.fn().mockResolvedValue(null);

        await service.updateArticle(1, 1, {} as ArticleDto);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('No user found');
      }
    });
    it('should throw 400 if article is not found', async () => {
      try {
        const user: User = {
          id: 1,
          name: 'John',
          email: 'john@mail.com',
          password: 'johnpass123',
          articles: [],
        };

        userRepository.findOneBy = jest.fn().mockResolvedValue(user);
        articleRepository.findOne = jest.fn().mockResolvedValue(null);

        await service.updateArticle(1, 1, {} as ArticleDto);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('No article found');
      }
    });
    it('should throw 400 if article.id and user.id are not matching', async () => {
      try {
        const user: User = {
          id: 1,
          name: 'John',
          email: 'john@mail.com',
          password: 'johnpass123',
          articles: [],
        };

        const articleDto: ArticleDto = {
          name: 'name',
          description: 'description',
        };

        const article: Article = {
          id: 1,
          user: {
            id: 2,
            ...user,
          },
          publishedAt: new Date(),
          ...articleDto,
        };

        userRepository.findOneBy = jest.fn().mockResolvedValue(user);
        articleRepository.findOne = jest.fn().mockResolvedValue(article);
        articleRepository.findOneBy = jest.fn().mockResolvedValue(article);

        await service.updateArticle(1, 1, articleDto);
      } catch (error: any) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Access not allowed');
      }
    });
  });

  describe('deleteArticle', () => {
    it('should return deleted article id', async () => {
      const user: User = {
        id: 1,
        name: 'John',
        email: 'john@mail.com',
        password: 'johnpass123',
        articles: [],
      };

      const article: Article = {
        id: 1,
        user: {
          id: 1,
          ...user,
        },
        publishedAt: new Date(),
        name: 'name',
        description: 'description',
      };

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);
      articleRepository.findOne = jest.fn().mockResolvedValue(article);
      articleRepository.delete = jest.fn().mockResolvedValue(123);

      const result = await service.deleteArticle(1, 1);

      expect(result).toEqual(article.id);
    });
    it('should throw 400 if user is not found', async () => {
      try {
        userRepository.findOneBy = jest.fn().mockResolvedValue(null);

        await service.deleteArticle(1, 1);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('No user found');
      }
    });
    it('should throw 400 if article is not found', async () => {
      try {
        const user: User = {
          id: 1,
          name: 'John',
          email: 'john@mail.com',
          password: 'johnpass123',
          articles: [],
        };

        userRepository.findOneBy = jest.fn().mockResolvedValue(user);

        await service.deleteArticle(1, 1);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('No user found');
      }
    });
    it('should throw 400 if article.id and user.id are not matching', async () => {
      try {
        const user: User = {
          id: 1,
          name: 'John',
          email: 'john@mail.com',
          password: 'johnpass123',
          articles: [],
        };

        const article: Article = {
          id: 1,
          user: {
            id: 2,
            ...user,
          },
          publishedAt: new Date(),
          name: 'name',
          description: 'description',
        };

        userRepository.findOneBy = jest.fn().mockResolvedValue(user);
        articleRepository.findOne = jest.fn().mockResolvedValue(article);

        await service.deleteArticle(1, 1);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('No user found');
      }
    });
  });

  describe('getArticleById', () => {
    it('should return article body', async () => {
      const article: Article = {
        id: 1,
        user: {} as User,
        publishedAt: new Date(),
        name: 'name',
        description: 'description',
      };

      articleRepository.findOne = jest.fn().mockResolvedValue(article);

      const result = await service.getArticleById(1);

      expect(result.name).toEqual(article.name);
      expect(result.publishedAt).toEqual(article.publishedAt);
    });
    it('should throw 400 if article is not found', async () => {
      try {
        articleRepository.findOne = jest.fn().mockResolvedValue(null);

        await service.getArticleById(1);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Article not found');
      }
    });
  });

  describe('getArticlesByAuthorId', () => {
    it('should return articles model array by author id', async () => {
      const user: User = {
        id: 1,
        name: 'John',
        email: 'john@mail.com',
        password: 'johnpass123',
        articles: [],
      };

      const article: Article = {
        id: 1,
        user: {
          id: 1,
          ...user,
        },
        publishedAt: new Date(),
        name: 'name',
        description: 'description',
      };

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);
      articleRepository.find = jest.fn().mockResolvedValue([article]);

      const result = await service.getArticlesByAuthorId(1, {
        page: 1,
        limit: 10,
      });

      expect(result[0].name).toEqual(article.name);
      expect(result[0].id).toEqual(article.id);
    });
    it('should throw 400 if user is not found', async () => {
      try {
        userRepository.findOneBy = jest.fn().mockResolvedValue(null);

        await service.getArticlesByAuthorId(1, {
          page: 1,
          limit: 10,
        });
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('getArticlesByDate', () => {
    it('should return articles model array by date', async () => {
      const article: Article = {
        id: 1,
        user: {
          id: 1,
        } as User,
        publishedAt: new Date(),
        name: 'name',
        description: 'description',
      };

      articleRepository.find = jest.fn().mockResolvedValue([article]);

      const result = await service.getArticlesByDate('19-04-2024', {
        page: 1,
        limit: 10,
      });

      expect(result[0].name).toEqual(article.name);
      expect(result[0].authorId).toEqual(article.user.id);
    });
  });
});
