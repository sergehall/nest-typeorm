import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiControllerDocumentation } from './api-documentation/decorators/api-controller-documentation.decorator';

@ApiTags('App')
@ApiControllerDocumentation()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
