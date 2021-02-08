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

  /**
   * Return information for a book by its good reads id.
   * You can specify any of the following fields:
   * id
   * authors
   * desc
   * image
   * large_image
   * pages
   * pub_date
   * publisher
   * title
   * @param id The book id to lookup.
   * @param fields The fields you want in the response.
   */
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
