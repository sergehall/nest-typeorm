import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base-config';
import { BasicAuthTypes } from './types/basic-auth.types';

@Injectable()
export class SaConfig extends BaseConfig {
  async getBasicAuth(basicAuth: BasicAuthTypes): Promise<string> {
    return await this.getValueBasicAuth(basicAuth);
  }
}
