import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('v1/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get(':id')
  async getBookResult(
    @Param('id') id: string,
    @Query('fields') fields: string,
  ): Promise<Record<any, unknown>> {
    const bookResult = await this.booksService.getResultForId(id, fields);
    if (bookResult.id === 0) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return bookResult;
  }
}
