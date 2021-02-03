import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchSuggestModule } from './search-suggest/search-suggest.module';

@Module({
  imports: [SearchSuggestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
