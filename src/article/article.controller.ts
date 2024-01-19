import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ArticleDto } from './models/article.dto';
import { ArticleService } from './article.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ValidationUtils } from '../utils/ValidationUtils';

@Controller('articles')
@UsePipes(ValidationPipe)
export class ArticleController {
  constructor(private service: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createNewArticle(
    @Req() req: Request,
    @Res() res: Response,
    @Body() article: ArticleDto,
  ) {
    const userFromRequest = req.body.user;

    article.name = article.name.trim();

    const createdArticle = await this.service.createNewArticle(
      article,
      userFromRequest.sub,
    );

    return res.status(201).json({
      status: 'OK',
      message: 'Successfully add new article',
      body: createdArticle,
    });
  }

  @Get(':id')
  async getOneArticle(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!id || !isFinite(id)) {
      return res.status(400).json({ error: 'Id field required' });
    }

    const article = await this.service.getArticleById(id);

    return res
      .status(200)
      .json({ status: 'OK', message: 'Success', body: article });
  }

  @Get('by-author/:id')
  async getArticlesByAuthorId(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: { page?: number; limit?: number },
  ) {
    if (!id || !isFinite(id)) {
      return res.status(400).json({ error: 'Id field required' });
    }

    if (!ValidationUtils.isValidPaginationParams(query)) {
      return res.status(400).json({
        error: 'Page and limit values should be => 0 ',
      });
    }

    const articles = await this.service.getArticlesByAuthorId(id, query);

    return res.status(200).json({
      status: 'OK',
      message: `Articles found: ${articles.length}`,
      body: articles,
    });
  }

  @Get('by-date/:date')
  async getArticlesByDate(
    @Res() res: Response,
    @Param('date') date: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    if (
      !date ||
      date.length === 0 ||
      !ValidationUtils.isValidDateFormatDDMMYYYY(date)
    ) {
      return res.status(400).json({
        error: 'Invalid date format (dd-mm-yyyy) or missing date parameter.',
      });
    }

    if (!ValidationUtils.isValidPaginationParams(query)) {
      return res.status(400).json({
        error: 'Page and limit values should be => 0 ',
      });
    }

    const articles = await this.service.getArticlesByDate(date, query);

    return res.status(200).json({
      status: 'OK',
      message: `Articles found: ${articles.length}`,
      body: articles,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateArticle(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() articleDto: ArticleDto,
  ) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ error: 'Id field required' });
    }

    const updated = await this.service.updateArticle(
      id,
      userFromRequest.sub,
      articleDto,
    );

    return res
      .status(200)
      .json({ status: 'OK', message: 'Success', body: updated });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userFromRequest = req.body.user;

    if (!id || !isFinite(id)) {
      return res.status(400).json({ error: 'Id field required' });
    }

    const articleId = await this.service.deleteArticle(id, userFromRequest.sub);

    return res.status(200).json({
      status: 'OK',
      message: `Article was removed with id: ${articleId}`,
    });
  }
}
