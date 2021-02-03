import { Injectable } from '@nestjs/common';
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
    return await keyv.get(query);
  }
}
