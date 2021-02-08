import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import got from 'got';
import { parse } from 'fast-xml-parser';

@Injectable()
export class SearchService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * TODO:
   * - Add in validation using a pipe
   * - Add in documentation and also swager docs
   * - add in pagination
   */
  async getResultsForQuery(query: string): Promise<Array<any>> {
    /**
     * - Check cache for query.
     * - Make request to GoodReads for results.
     * - Strip results of data we do not need.
     * - Cache results.
     * - Return results.
     */
    let results;
    try {
      results = await this.cacheManager.get('searchquery:' + query);
    } catch (ignored) {}
    if (!Array.isArray(results)) {
      results = await this.makeRequest(query);
      results = this.cleanResults(results);
      await this.cacheManager.set('searchquery:' + query, results, {
        ttl: 86400,
      }); //cache for 24 hours
    }
    return results;
  }

  async makeRequest(query: string): Promise<Array<any>> {
    const resp = await got(
      `https://www.goodreads.com/search/index.xml?key=RDfV4oPehM6jNhxfNQzzQ&page=1&search=all&q=${query}`,
    );
    const jsonObj = parse(resp.body, {});
    let results = [];
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
      results = jsonObj.GoodreadsResponse.search.results.work;
    }
    return results;
  }

  cleanResults(results: Array<any>): Array<any> {
    results = results.map((result) => {
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
