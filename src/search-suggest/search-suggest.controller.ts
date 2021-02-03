import { Controller, Get, Query } from '@nestjs/common';
import { SearchSuggestService } from './search-suggest.service';

@Controller('search-suggest')
export class SearchSuggestController {
  constructor(private readonly searchSuggestService: SearchSuggestService) {}

  @Get()
  async getSuggestion(@Query('q') query: string): Promise<any> {
    return await this.searchSuggestService.getTitlesForQuery(query);
  }
}
