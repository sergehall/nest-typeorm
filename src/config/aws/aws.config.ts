import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseConfig } from '../base/base.config';
import { AwsKeysTypes } from './types/aws-keys.types';

@Injectable()
export class AwsConfig extends BaseConfig {
  private config: Record<string, string> = {
    ACCESS_KEY_ID: 'ACCESS_KEY_ID',
    SECRET_ACCESS_KEY: 'SECRET_ACCESS_KEY',
    AWS_ENDPOINT: 'AWS_ENDPOINT',
    S3_PRIVATE_BUCKET: 'S3_PRIVATE_BUCKET',
    S3_PUBLIC_BUCKET: 'S3_PUBLIC_BUCKET',
    S3_REGION: 'S3_REGION',
  };

  private async getAwsValue(key: AwsKeysTypes): Promise<string> {
    if (this.config.hasOwnProperty(key)) {
      return this.getValueAwsByKey(key);
    } else {
      throw new BadRequestException(
        `Key ${key} not found in AWS configuration`,
      );
    }
  }

  async getAwsConfig(key: AwsKeysTypes): Promise<string> {
    return this.getAwsValue(key);
  }
}
