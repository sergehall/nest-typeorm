import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from './testing.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllCollections() {
    return this.testingService.removeAllCollections();
  }
}
