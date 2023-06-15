import { Test, TestingModule } from '@nestjs/testing';
import { DemonsService } from './demons.service';
import { AppModule } from '../../../app.module';

describe('DemonsService', () => {
  let service: DemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<DemonsService>(DemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
