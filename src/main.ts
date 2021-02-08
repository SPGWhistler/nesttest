import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001);
}
bootstrap();

  /*
   * - Add field selection to the books and search endpoints using the fields param.
   * - Add cache headers?
   * - Add in documentation and also swager docs
   */