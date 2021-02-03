import { Test, TestingModule } from '@nestjs/testing';
import { SearchSuggestController } from './search-suggest.controller';

describe('SearchSuggestController', () => {
  let controller: SearchSuggestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchSuggestController],
    }).compile();

    controller = module.get<SearchSuggestController>(SearchSuggestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
