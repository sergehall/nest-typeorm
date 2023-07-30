import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base-config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';

@Injectable()
export class ThrottleConfig
  extends BaseConfig
  implements ThrottlerOptionsFactory
{
  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      ttl: this.getValueThrottle('THROTTLE_TTL'), // Maximum number of requests in the given time frame
      limit: this.getValueThrottle('THROTTLE_LIMIT'), // Time to keep records of requests in memory (milliseconds)
    };
  }
}
