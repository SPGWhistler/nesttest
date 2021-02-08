import { Controller, Get, Query } from '@nestjs/common';
import { SearchSuggestService } from './search-suggest.service';

@Controller('/v1/search-suggest')
export class SearchSuggestController {
  constructor(private readonly searchSuggestService: SearchSuggestService) {}

  /**
   * Return a list of suggestions for the given query.
   * @param query The search query to find suggestions for.
   */
  @Get()
  async getSuggestion(@Query('q') query: string): Promise<any> {
    return await this.searchSuggestService.getTitlesForQuery(query);
  }
}
