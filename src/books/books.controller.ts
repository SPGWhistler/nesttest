import { Controller, Get, Param } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('v1/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get(':id')
  /*
   * - Make sure to have error handling with proper http status codes.
   * - Add pagination using limit and offset
   * - Add field selection to the books and search endpoints using the fields param.
   * - Add v1 to all paths
   * - see if I can use https (I think I can)
   * - add access control header
   * - Add cache headers?
   */
  async getBookResult(@Param('id') id: string): Promise<Record<any, unknown>> {
    return await this.booksService.getResultForId(id);
  }
}
