import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from '../testing.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}
  // @Delete('all-data')
  @Delete('all-data-mongoose')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllCollections(): Promise<boolean> {
    return this.testingService.removeAllCollections();
  }
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllDataRawSQL(): Promise<void> {
    return this.testingService.removeAllDataRawSQL();
  }
}
