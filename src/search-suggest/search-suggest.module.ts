import { Module } from '@nestjs/common';
import { SearchSuggestController } from './search-suggest.controller';
import { SearchSuggestService } from './search-suggest.service';

@Module({
  controllers: [SearchSuggestController],
  providers: [SearchSuggestService],
})
export class SearchSuggestModule {}
