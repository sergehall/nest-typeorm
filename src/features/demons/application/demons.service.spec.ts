import { Test, TestingModule } from '@nestjs/testing';
import { DemonsService } from './demons.service';

describe('DemonsService', () => {
  let service: DemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemonsService],
    }).compile();

    service = module.get<DemonsService>(DemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
