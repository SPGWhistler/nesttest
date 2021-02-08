import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchSuggestModule } from './search-suggest/search-suggest.module';
import { SearchModule } from './search/search.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [SearchSuggestModule, SearchModule, BooksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
