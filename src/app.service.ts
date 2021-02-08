import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<any> {
    return "These aren't the droids you're looking for.";
  }
}
