import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { JwtKeysType } from './types/jwt-keys.types';

@Injectable()
export class JwtConfig extends BaseConfig {
  private config: Record<string, string> = {
    ACCESS_SECRET_KEY: 'ACCESS_SECRET_KEY',
    REFRESH_SECRET_KEY: 'REFRESH_SECRET_KEY',
    EXP_ACC_TIME: 'EXP_ACC_TIME',
    EXP_REF_TIME: 'EXP_REF_TIME',
  };

  private getJwtValue(key: JwtKeysType): string {
    if (this.config.hasOwnProperty(key)) {
      return this.getValueJwtByKey(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in JWT configuration`,
      );
    }
  }

  getJwtConfigValue(key: JwtKeysType): string {
    return this.getJwtValue(key);
  }
}
