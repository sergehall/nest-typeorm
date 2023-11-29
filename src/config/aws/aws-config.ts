import { Injectable } from '@nestjs/common';
import { AwsAccessKeyType } from './types/aws-access-key.type';
import { BaseConfig } from '../base/base-config';
import { BucketNamesType } from './types/bucket-names.type';

@Injectable()
export class AwsConfig extends BaseConfig {
  async getAccessKeyId(key: AwsAccessKeyType): Promise<string> {
    return await this.getValueAccessKeyId(key);
  }
  async getSecretAccessKey(key: AwsAccessKeyType): Promise<string> {
    return await this.getValueSecretAccessKey(key);
  }

  async getBucketName(key: BucketNamesType): Promise<string> {
    return await this.getValueBucketName(key);
  }
}
