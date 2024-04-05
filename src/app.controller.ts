import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocumentation } from './common/decorators/api-documentation.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiDocumentation.apply('App')
  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
