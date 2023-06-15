import { Test, TestingModule } from '@nestjs/testing';
import { SaService } from './sa.service';
import { AppModule } from '../../../app.module';

describe('SaService', () => {
  let service: SaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<SaService>(SaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
