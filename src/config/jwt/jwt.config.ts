import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';

@Injectable()
export class JwtConfig extends BaseConfig {
  getAccSecretKey(): string {
    return this.getValueString('ACCESS_SECRET_KEY', 'SECRET_KEY');
  }
  getRefSecretKey(): string {
    return this.getValueString('REFRESH_SECRET_KEY', 'SECRET_KEY');
  }
  getExpAccTime(): string {
    return this.getValueString('EXP_ACC_TIME', '10s');
  }
  getExpRefTime(): string {
    return this.getValueString('EXP_REF_TIME', '20s');
  }
}
