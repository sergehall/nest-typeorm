import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base-config';

@Injectable()
export class JwtConfig extends BaseConfig {
  async getAccSecretKey(): Promise<string> {
    return await this.getValueString('ACCESS_SECRET_KEY', 'SECRET_KEY');
  }
  async getRefSecretKey(): Promise<string> {
    return await this.getValueString('REFRESH_SECRET_KEY', 'SECRET_KEY');
  }
  async getExpAccTime(): Promise<string> {
    return await this.getValueString('EXP_ACC_TIME', '300s');
  }
  async getExpRefTime(): Promise<string> {
    return await this.getValueString('EXP_REF_TIME', '600s');
  }
}
