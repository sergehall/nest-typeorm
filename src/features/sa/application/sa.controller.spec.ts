import { Test, TestingModule } from '@nestjs/testing';
import { SaController } from './sa.controller';
import { SaService } from './sa.service';

describe('SaController', () => {
  let controller: SaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaController],
      providers: [SaService],
    }).compile();

    controller = module.get<SaController>(SaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
