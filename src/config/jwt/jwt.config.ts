import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';

import { JwtKeysType } from './types/jwt-keys.type';

@Injectable()
export class JwtConfig extends BaseConfig {
  private config: Record<string, string> = {
    ACCESS_SECRET_KEY: 'ACCESS_SECRET_KEY',
    REFRESH_SECRET_KEY: 'REFRESH_SECRET_KEY',
    EXP_ACC_TIME: 'EXP_ACC_TIME',
    EXP_REF_TIME: 'EXP_REF_TIME',
  };

  private async getJwtValue(key: JwtKeysType): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getJwtValueByKey(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in JWT configuration`,
      );
    }
  }

  async getJwtConfigValue(key: JwtKeysType): Promise<string> {
    return this.getJwtValue(key);
  }
}
