import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base-config';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration';
import { NumberThrottlerEnums } from './enums/number-throttler.enums';

@Injectable()
export class ThrottleConfig extends BaseConfig {
  constructor(configService: ConfigService<ConfigType, true>) {
    super(configService);
  }
  getThrottleTTL(): number {
    return this.getValueNumber(
      'THROTTLE_TTL',
      NumberThrottlerEnums.THROTTLE_TTL,
    );
  }
  getThrottleLIMIT(): number {
    return this.getValueNumber(
      'THROTTLE_LIMIT',
      NumberThrottlerEnums.THROTTLE_LIMIT,
    );
  }
}
