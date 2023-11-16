import { Injectable } from '@nestjs/common';
import { AwsAccessKeyType } from './types/aws-access-key-types';
import { BaseConfig } from '../base/base-config';

@Injectable()
export class AwsConfig extends BaseConfig {
  async getAccessKeyId(key: AwsAccessKeyType): Promise<string> {
    return await this.getValueAccessKeyId(key);
  }
  async getSecretAccessKey(key: AwsAccessKeyType): Promise<string> {
    return await this.getValueSecretAccessKey(key);
  }
}
