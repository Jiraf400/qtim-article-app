import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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

  @Get('/hello')
  getHello(@Req() req: Request, @Res() res: Response) {
    return res.status(200).json({ message: `Hello!!! ${new Date()}` });
  }

  @Get(':id')
  async getOneArticle(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required' });
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
  ) {
    if (!id || !isFinite(id)) {
      return res.status(400).json({ message: 'Id field required' });
    }

    const articles = await this.service.getArticlesByAuthorId(id);

    return res.status(200).json({
      status: 'OK',
      message: `Articles found: ${articles.length}`,
      body: articles,
    });
  }

  @Get('by-date/:date')
  async getArticlesByDate(@Res() res: Response, @Param('date') date: string) {
    if (!date || date.length == 0) {
      return res.status(400).json({ message: 'Date param required' });
    }

    if (!isValidDateFormatDDMMYYYY(date)) {
      return res
        .status(400)
        .json({ message: 'Date format not equal to dd-mm-yyyy' });
    }

    const articles = await this.service.getArticlesByDate(date);

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
      return res.status(400).json({ message: 'Id field required' });
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
      return res.status(400).json({ message: 'Id field required' });
    }

    const articleId = await this.service.deleteArticle(id, userFromRequest.sub);

    return res.status(200).json({
      status: 'OK',
      message: `Article was removed with id: ${articleId}`,
    });
  }
}

function isValidDateFormatDDMMYYYY(dateString: string): boolean {
  const dateFormatRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

  return dateFormatRegex.test(dateString);
}
