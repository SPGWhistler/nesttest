import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import got from 'got';
import { parse } from 'fast-xml-parser';
import { ConfigService } from '@nestjs/config';

export interface Results {
  totalPages: number;
  currentPage: number;
  results: Array<any>;
}

@Injectable()
export class SearchService {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getResultsForQuery(query: string, page = 1): Promise<Results> {
    let results: Results;
    if (page === 1) {
      try {
        results = await this.cacheManager.get('searchquery:' + query);
      } catch (ignored) {}
    }
    if (!results || !Array.isArray(results.results)) {
      results = await this.makeRequest(query, page);
      results = this.cleanResults(results);
      if (page === 1) {
        await this.cacheManager.set('searchquery:' + query, results, {
          ttl: 86400,
        }); //cache for 24 hours
      }
    }
    return results;
  }

  async makeRequest(query: string, page = 1): Promise<Results> {
    //const bookApiHost = this.configService.get<string>('BOOK_API_HOST');
    //const bookApiKey = this.configService.get<string>('BOOK_API_KEY');
    const bookApiHost = 'https://www.goodreads.com';
    const bookApiKey = 'RDfV4oPehM6jNhxfNQzzQ';
    let results: Results = {
      results: [],
      totalPages: 0,
      currentPage: 0,
    };
    try {
      const resp = await got(
        `${bookApiHost}/search/index.xml?key=${bookApiKey}&page=${page}&search=all&q=${query}`,
      );
      if (resp.statusCode === 200) {
        const jsonObj = parse(resp.body, {});
        if (
          jsonObj &&
          jsonObj.GoodreadsResponse &&
          jsonObj.GoodreadsResponse.search &&
          jsonObj.GoodreadsResponse.search.results &&
          jsonObj.GoodreadsResponse.search.results.work
        ) {
          if (!Array.isArray(jsonObj.GoodreadsResponse.search.results.work)) {
            jsonObj.GoodreadsResponse.search.results.work = [
              jsonObj.GoodreadsResponse.search.results.work
            ];
          }
          results = {
            results: jsonObj.GoodreadsResponse.search.results.work,
            totalPages: this.calculateTotalPages(
              jsonObj.GoodreadsResponse.search['total-results'] || 0,
            ),
            currentPage: page,
          };
        }
      }
    } catch (ignored) {}
    return results;
  }

  calculateTotalPages(totalResults: number): number {
    if (totalResults <= 0) {
      return 0; //no results
    } else if (totalResults > 0 && totalResults < 20) {
      return 1; //1 page of results
    } else if (totalResults / 20 > 100) {
      return 100; //more than 100 pages, api only returns 100 tho, so limit it to that
    } else {
      return Math.ceil(totalResults / 20); //return actual number of pages
    }
  }

  cleanResults(results: Results): Results {
    results.results = results.results.map((result) => {
      return {
        id: result.best_book.id,
        title: result.best_book.title,
        image: result.best_book.image_url,
        attr: result.best_book.author.name,
      };
    });
    return results; //TODO filter fields here
  }
}
