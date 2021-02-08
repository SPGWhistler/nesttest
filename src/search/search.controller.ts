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
      this.cleanPageNumber(page),
    );
  }

  cleanPageNumber(dirtyInput: any): number {
    let parsed = Number.parseInt(dirtyInput, 10);
    parsed = Number.isNaN(parsed) ? 1 : parsed;
    if (parsed < 1) return 1;
    if (parsed > 100) return 100;
    return parsed;
  }
}
