import { Controller, Get, Query } from '@nestjs/common';
import { SearchService, Results } from './search.service'

@Controller('/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async getSearchResults(
    @Query('q') query: string,
    @Query('page') page = '1',
  ): Promise<Results> {
    return await this.searchService.getResultsForQuery(
      query,
      parseInt(page, 10),
    );
  }
}
