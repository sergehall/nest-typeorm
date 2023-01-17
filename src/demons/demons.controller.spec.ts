import { Test, TestingModule } from '@nestjs/testing';
import { DemonsController } from './demons.controller';
import { DemonsService } from './demons.service';

describe('DemonsController', () => {
  let controller: DemonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemonsController],
      providers: [DemonsService],
    }).compile();

    controller = module.get<DemonsController>(DemonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
