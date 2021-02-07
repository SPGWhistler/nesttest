import { Controller, Get, Param } from '@nestjs/common';
import { BookService } from './book.service';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get(':id')
  async getBookResult(@Param('id') id: string): Promise<Record<any, unknown>> {
    return await this.bookService.getResultForId(id);
  }
}
