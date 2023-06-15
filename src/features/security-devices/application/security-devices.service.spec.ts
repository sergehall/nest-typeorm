import { Test, TestingModule } from '@nestjs/testing';
import { SecurityDevicesService } from './security-devices.service';
import { AppModule } from '../../../app.module';

describe('SecurityDevicesService', () => {
  let service: SecurityDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<SecurityDevicesService>(SecurityDevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
