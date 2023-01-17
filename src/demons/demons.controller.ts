import { Controller } from '@nestjs/common';
import { DemonsService } from './demons.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('demons')
export class DemonsController {
  constructor(private readonly demonsService: DemonsService) {}
}
