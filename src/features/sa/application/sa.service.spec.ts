import { Test, TestingModule } from '@nestjs/testing';
import { SaService } from './sa.service';
import { AppModule } from '../../../app.module';
import { INestApplication } from '@nestjs/common';
import { createApp } from '../../../create-app';

describe('SaService', () => {
  let service: SaService;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<SaService>(SaService);
    app = module.createNestApplication();
    app = createApp(app);
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
