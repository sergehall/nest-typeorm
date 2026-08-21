import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { API_VERSION } from './api-documentation/swagger.config';
import { HealthResponseDto, LivenessResponseDto } from './health/dto/health-response.dto';

const HEALTH_CACHE_TTL_MS = 5_000;

@Injectable()
export class AppService {
  private cachedHealth: { readonly expiresAt: number; readonly value: HealthResponseDto } | null =
    null;
  private pendingHealthCheck: Promise<HealthResponseDto> | null = null;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getHealth(): Promise<HealthResponseDto> {
    const now = Date.now();
    if (this.cachedHealth && this.cachedHealth.expiresAt > now) {
      return this.cachedHealth.value;
    }

    if (this.pendingHealthCheck) {
      return this.pendingHealthCheck;
    }

    this.pendingHealthCheck = this.checkReadiness();

    try {
      const health = await this.pendingHealthCheck;
      this.cachedHealth = { expiresAt: Date.now() + HEALTH_CACHE_TTL_MS, value: health };
      return health;
    } finally {
      this.pendingHealthCheck = null;
    }
  }

  getLiveness(): LivenessResponseDto {
    return {
      status: 'up',
      service: 'NestLab API',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  private async checkReadiness(): Promise<HealthResponseDto> {
    const startedAt = Date.now();
    let databaseStatus: 'up' | 'down' = 'down';
    let databaseMessage = 'PostgreSQL is unavailable.';
    let databaseResponseTimeMs: number | null = null;

    try {
      if (!this.dataSource.isInitialized) {
        throw new Error('Data source is not initialized.');
      }

      await this.dataSource.query('SELECT 1');
      databaseStatus = 'up';
      databaseMessage = 'PostgreSQL accepted a validation query.';
      databaseResponseTimeMs = Date.now() - startedAt;
    } catch {
      databaseResponseTimeMs = Date.now() - startedAt;
    }

    return {
      status: databaseStatus === 'up' ? 'healthy' : 'degraded',
      service: 'NestLab API',
      version: API_VERSION,
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      checks: {
        api: {
          status: 'up',
          message: 'NestJS is accepting HTTP requests.',
          responseTimeMs: 0,
        },
        database: {
          status: databaseStatus,
          message: databaseMessage,
          responseTimeMs: databaseResponseTimeMs,
        },
      },
    };
  }
}
