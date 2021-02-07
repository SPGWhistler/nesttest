import { Injectable } from '@nestjs/common';
import got from 'got';
import { parse } from 'fast-xml-parser';
const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile;

const keyv = new Keyv({
  store: new KeyvFile({
    filename: './titles.json'
  })
});

@Injectable()
export class SearchSuggestService {
  async getTitlesForQuery(query: string): Promise<any> {
    let results;
    try {
      results = await keyv.get(query);
    } catch (ignored) {}
    if (!Array.isArray(results)) {
      results = await this.makeRequest(query);
      results = this.cleanResults(results);
      await keyv.set(query, results);
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
    results = results.map((result) => result.best_book.title);
    results = results.slice(0, 5);
    return results; //TODO
  }
}
