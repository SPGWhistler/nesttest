import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Return the base path response.
   */
  async getHello(): Promise<any> {
    return "These aren't the droids you're looking for.";
  }
}
