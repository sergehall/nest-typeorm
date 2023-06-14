import { Test, TestingModule } from '@nestjs/testing';
import { SaService } from './sa.service';
import { SaController } from './sa.controller';

describe('SaController', () => {
  let controller: SaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaController],
      providers: [SaService],
    }).compile();

    controller = module.get<SaController>(SaController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });
});
