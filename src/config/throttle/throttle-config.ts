import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base-config';
import { NumberThrottlerEnums } from './enums/number-throttler.enums';
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
      ttl: this.getThrottleLIMIT(), // Maximum number of requests in the given time frame
      limit: this.getThrottleTTL(), // Time to keep records of requests in memory (milliseconds)
    };
  }
  private getThrottleTTL(): number {
    return this.getValueNumber(
      'THROTTLE_TTL',
      NumberThrottlerEnums.THROTTLE_TTL,
    );
  }
  private getThrottleLIMIT(): number {
    return this.getValueNumber(
      'THROTTLE_LIMIT',
      NumberThrottlerEnums.THROTTLE_LIMIT,
    );
  }
}
