import { Test, TestingModule } from '@nestjs/testing';
import { SecurityDevicesService } from './security-devices.service';

describe('SecurityDevicesService', () => {
  let service: SecurityDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityDevicesService],
    }).compile();

    service = module.get<SecurityDevicesService>(SecurityDevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
