import { Test, TestingModule } from '@nestjs/testing';
import { SaService } from './sa.service';

describe('SaService', () => {
  let service: SaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaService],
    }).compile();

    service = module.get<SaService>(SaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
