import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchSuggestModule } from './search-suggest/search-suggest.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [SearchSuggestModule, SearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
