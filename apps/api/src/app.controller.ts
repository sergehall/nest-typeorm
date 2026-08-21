import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiOkResponse,
  ApiProduces,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiControllerDocumentation } from './api-documentation/decorators/api-controller-documentation.decorator';
import { Response } from 'express';
import { renderApiDashboard } from './api-dashboard/api-dashboard.renderer';
import { HealthResponseDto, LivenessResponseDto } from './health/dto/health-response.dto';
import { ensureResponseCspNonce } from './common/security/content-security-policy';

@ApiTags('App')
@ApiControllerDocumentation()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiProduces('text/html')
  @ApiOkResponse({
    description: 'Backend dashboard with health, documentation, and endpoint navigation.',
    schema: { type: 'string', example: '<!doctype html>...' },
  })
  async getApiDashboard(@Res() response: Response): Promise<void> {
    const health = await this.appService.getHealth();
    const webUrl = process.env.WEB_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:3000';
    const cspNonce = ensureResponseCspNonce(response);

    response.type('html').send(renderApiDashboard({ health, webUrl, cspNonce }));
  }

  @Get('health')
  @ApiOkResponse({
    description: 'The API and PostgreSQL database are operational.',
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'The API is running, but PostgreSQL is unavailable.',
    type: HealthResponseDto,
  })
  async getHealth(@Res({ passthrough: true }) response: Response): Promise<HealthResponseDto> {
    const health = await this.appService.getHealth();

    if (health.status === 'degraded') {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return health;
  }

  @Get('health/live')
  @ApiOkResponse({
    description: 'The NestJS process is running. This check does not query PostgreSQL.',
    type: LivenessResponseDto,
  })
  getLiveness(): LivenessResponseDto {
    return this.appService.getLiveness();
  }

  @Get('health/ready')
  @ApiOkResponse({
    description: 'The API is ready and PostgreSQL accepts validation queries.',
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'The process is alive, but PostgreSQL is unavailable.',
    type: HealthResponseDto,
  })
  async getReadiness(@Res({ passthrough: true }) response: Response): Promise<HealthResponseDto> {
    return this.getHealth(response);
  }
}
