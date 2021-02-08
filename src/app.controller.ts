import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * An entry point for the base path.
   */
  @Get()
  async getHello(): Promise<any> {
    return await this.appService.getHello();
  }
}
