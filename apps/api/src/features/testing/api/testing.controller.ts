import { Controller, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { TestingService } from '../application/testing.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiControllerDocumentation } from '../../../api-documentation/decorators/api-controller-documentation.decorator';
import { ProductionDisabledGuard } from '../../../common/guards/production-disabled.guard';

@ApiTags('Testing')
@ApiControllerDocumentation()
@UseGuards(ProductionDisabledGuard)
@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllDataRawSQL(): Promise<void> {
    return this.testingService.removeAllDataRawSQL();
  }
}
