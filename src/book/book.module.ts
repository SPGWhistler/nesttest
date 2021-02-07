import { CacheModule, Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';

@Module({
  imports: [CacheModule.register()],
  controllers: [BookController],
  providers: [BookService]
})
export class BookModule {}
