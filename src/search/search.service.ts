import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import got from 'got';
import { parse } from 'fast-xml-parser';

export interface Results {
  totalPages: number;
  results: Array<any>;
}

@Injectable()
export class SearchService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * TODO:
   * - Add in validation using a pipe
   * - Add in documentation and also swager docs
   * - add in pagination
   */
  async getResultsForQuery(query: string, page = 1): Promise<Results> {
    /**
     * - Check cache for query.
     * - Make request to GoodReads for results.
     * - Strip results of data we do not need.
     * - Cache results.
     * - Return results.
     */
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
    const resp = await got(
      `https://www.goodreads.com/search/index.xml?key=RDfV4oPehM6jNhxfNQzzQ&page=${page}&search=all&q=${query}`,
    );
    const jsonObj = parse(resp.body, {});
    let results: Results = {
      results: [],
      totalPages: 0,
    };
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
      };
    }
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
    return results; //TODO
  }
}
