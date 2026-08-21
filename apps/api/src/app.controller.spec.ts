import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthResponseDto } from './health/dto/health-response.dto';

function createHealth(status: HealthResponseDto['status']): HealthResponseDto {
  const databaseIsUp = status === 'healthy';

  return {
    status,
    service: 'NestLab API',
    version: '1.36.0',
    environment: 'test',
    timestamp: '2026-08-20T20:45:00.000Z',
    uptimeSeconds: 42,
    checks: {
      api: {
        status: 'up',
        message: 'NestJS is accepting HTTP requests.',
        responseTimeMs: 0,
      },
      database: {
        status: databaseIsUp ? 'up' : 'down',
        message: databaseIsUp
          ? 'PostgreSQL accepted a validation query.'
          : 'PostgreSQL is unavailable.',
        responseTimeMs: databaseIsUp ? 7 : null,
      },
    },
  };
}

function createResponseMock(): jest.Mocked<Pick<Response, 'send' | 'status' | 'type'>> {
  const response = {
    send: jest.fn(),
    status: jest.fn(),
    type: jest.fn(),
  };

  response.send.mockReturnValue(response as unknown as Response);
  response.status.mockReturnValue(response as unknown as Response);
  response.type.mockReturnValue(response as unknown as Response);

  return response;
}

describe('AppController API surface', () => {
  const appService = {
    getHealth: jest.fn<Promise<HealthResponseDto>, []>(),
  };
  const controller = new AppController(appService as unknown as AppService);

  beforeEach(() => {
    appService.getHealth.mockReset();
  });

  it('renders the backend dashboard as HTML from the API root', async () => {
    const response = createResponseMock();
    appService.getHealth.mockResolvedValue(createHealth('healthy'));

    await controller.getApiDashboard(response as unknown as Response);

    expect(response.type).toHaveBeenCalledWith('html');
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('Backend control surface.'));
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('Swagger UI'));
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('PostgreSQL database'));
  });

  it('returns a healthy machine-readable contract without changing the status code', async () => {
    const response = createResponseMock();
    const expectedHealth = createHealth('healthy');
    appService.getHealth.mockResolvedValue(expectedHealth);

    const health = await controller.getHealth(response as unknown as Response);

    expect(health).toEqual(expectedHealth);
    expect(response.status).not.toHaveBeenCalled();
  });

  it('sets service unavailable when PostgreSQL is down', async () => {
    const response = createResponseMock();
    const expectedHealth = createHealth('degraded');
    appService.getHealth.mockResolvedValue(expectedHealth);

    const health = await controller.getHealth(response as unknown as Response);

    expect(health).toEqual(expectedHealth);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
