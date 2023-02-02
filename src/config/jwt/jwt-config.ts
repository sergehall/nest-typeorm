import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration';
import { BaseConfig } from '../base/base-config';

@Injectable()
export class JwtConfig extends BaseConfig {
  constructor(configService: ConfigService<ConfigType, true>) {
    super(configService);
  }
  getAccSecretKey(): string | undefined {
    return this.getValueString('ACCESS_SECRET_KEY', 'SECRET_KEY');
  }
  getRefSecretKey(): string | undefined {
    return this.getValueString('REFRESH_SECRET_KEY', 'SECRET_KEY');
  }
  getExpAccTime(): string | undefined {
    return this.getValueString('EXP_ACC_TIME', '300s');
  }
  getExpRefTime(): string | undefined {
    return this.getValueString('EXP_REF_TIME', '600s');
  }
}
