import { Injectable } from '@nestjs/common';
const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile;

const keyv = new Keyv({
  store: new KeyvFile({
    filename: './titles.json'
  })
});

@Injectable()
export class AppService {
  async getHello(): Promise<any> {
    return await keyv.get('000');
  }
}
