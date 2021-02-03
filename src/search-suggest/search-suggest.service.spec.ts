import { Test, TestingModule } from '@nestjs/testing';
import { SearchSuggestService } from './search-suggest.service';

describe('SearchSuggestService', () => {
  let service: SearchSuggestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchSuggestService],
    }).compile();

    service = module.get<SearchSuggestService>(SearchSuggestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
