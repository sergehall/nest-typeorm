import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from '../application/testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllDataRawSQL(): Promise<void> {
    return this.testingService.removeAllDataRawSQL();
  }
}
