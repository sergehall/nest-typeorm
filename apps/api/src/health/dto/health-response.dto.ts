import { ApiProperty } from '@nestjs/swagger';

export class HealthIndicatorDto {
  @ApiProperty({
    enum: ['up', 'down'],
    example: 'up',
    description: 'Current state of the health indicator.',
  })
  status: 'up' | 'down';

  @ApiProperty({
    example: 'PostgreSQL accepted a validation query.',
    description: 'Human-readable health check result.',
  })
  message: string;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 12,
    description: 'Health check duration in milliseconds, when available.',
  })
  responseTimeMs: number | null;
}

export class HealthChecksDto {
  @ApiProperty({ type: HealthIndicatorDto })
  api: HealthIndicatorDto;

  @ApiProperty({ type: HealthIndicatorDto })
  database: HealthIndicatorDto;
}

export class HealthResponseDto {
  @ApiProperty({
    enum: ['healthy', 'degraded'],
    example: 'healthy',
    description: 'Aggregate service health.',
  })
  status: 'healthy' | 'degraded';

  @ApiProperty({ example: 'NestLab API' })
  service: string;

  @ApiProperty({ example: '1.36.0' })
  version: string;

  @ApiProperty({ example: 'development' })
  environment: string;

  @ApiProperty({
    format: 'date-time',
    example: '2026-08-20T20:45:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    type: Number,
    example: 125,
    description: 'Process uptime rounded down to whole seconds.',
  })
  uptimeSeconds: number;

  @ApiProperty({ type: HealthChecksDto })
  checks: HealthChecksDto;
}

export class LivenessResponseDto {
  @ApiProperty({ enum: ['up'], example: 'up' })
  status: 'up';

  @ApiProperty({ example: 'NestLab API' })
  service: string;

  @ApiProperty({ format: 'date-time', example: '2026-08-20T20:45:00.000Z' })
  timestamp: string;

  @ApiProperty({ type: Number, example: 125 })
  uptimeSeconds: number;
}
