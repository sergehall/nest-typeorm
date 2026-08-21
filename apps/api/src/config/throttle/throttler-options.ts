import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { ThrottlerModuleOptions, ThrottlerOptionsFactory } from '@nestjs/throttler';

const MILLISECONDS_PER_SECOND = 1_000;

@Injectable()
export class ThrottlerOptions extends BaseConfig implements ThrottlerOptionsFactory {
  async createThrottlerOptions(): Promise<ThrottlerModuleOptions> {
    if (process.env.NODE_ENV === 'test') {
      return {
        throttlers: [
          { name: 'short', ttl: 1_000, limit: 10_000 },
          { name: 'medium', ttl: 10_000, limit: 10_000 },
          { name: 'long', ttl: 60_000, limit: 10_000 },
        ],
      };
    }

    const configuredTtl: number = await this.getValueThrottle('THROTTLE_TTL');
    const limit: number = await this.getValueThrottle('THROTTLE_LIMIT');
    const longTtl =
      configuredTtl < MILLISECONDS_PER_SECOND
        ? configuredTtl * MILLISECONDS_PER_SECOND
        : configuredTtl;

    return {
      throttlers: [
        { name: 'short', ttl: 1_000, limit: 10, blockDuration: 2_000 },
        { name: 'medium', ttl: 10_000, limit: 50, blockDuration: 10_000 },
        { name: 'long', ttl: longTtl, limit, blockDuration: longTtl },
      ],
    };
  }
}
