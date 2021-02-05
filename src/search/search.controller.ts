import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service'

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async getSearchResults(@Query('q') query: string): Promise<Array<any>> {
    return await this.searchService.getResultsForQuery(query);
  }
}
