import { Injectable } from '@nestjs/common';
import got from 'got';
import { parse } from 'fast-xml-parser';
import { ConfigService } from '@nestjs/config';
const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile;

const keyv = new Keyv({
  store: new KeyvFile({
    filename: './titles.json'
  })
});

@Injectable()
export class SearchSuggestService {
  constructor(private configService: ConfigService) {}
  async getTitlesForQuery(query: string): Promise<Array<string>> {
    let results;
    try {
      results = await keyv.get(query);
    } catch (ignored) {}
    if (!results || !Array.isArray(results)) {
      results = await this.makeRequest(query);
      results = this.cleanResults(results);
      await keyv.set(query, results);
    }
    return results;
  }
  async makeRequest(query: string): Promise<Array<string>> {
    const bookApiHost = this.configService.get<string>('BOOK_API_HOST');
    const bookApiKey = this.configService.get<string>('BOOK_API_KEY');
    let results = [];
    try {
      const resp = await got(
        `${bookApiHost}/search/index.xml?key=${bookApiKey}&page=1&search=all&q=${query}`,
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
          results = jsonObj.GoodreadsResponse.search.results.work;
        }
      }
    } catch (ignored) {}
    return results;
  }

  cleanResults(results: Array<any>): Array<string> {
    results = results.map((result) => result.best_book.title);
    results = results.slice(0, 5);
    return results;
  }
}
