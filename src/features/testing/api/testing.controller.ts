import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from '../application/testing.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllDataRawSQL(): Promise<void> {
    return this.testingService.removeAllDataRawSQL();
  }
}
