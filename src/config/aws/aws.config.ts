import { Injectable } from '@nestjs/common';
import { AwsAccessKeyType } from './types/aws-access-key.type';
import { BaseConfig } from '../base/base.config';
import { AwsEndpointType } from './types/aws-endpoint.type';
import {
  S3BPublicBucketNameType,
  S3PrivateBucketNameType,
} from './types/s3-bucket-name.type';
import { S3RegionNameType } from './types/s3-region-name.type';

@Injectable()
export class AwsConfig extends BaseConfig {
  async getAccessKeyId(key: AwsAccessKeyType): Promise<string> {
    return await this.getValueAccessKeyId(key);
  }
  async getSecretAccessKey(key: AwsAccessKeyType): Promise<string> {
    return await this.getValueSecretAccessKey(key);
  }

  async getEndpoint(key: AwsEndpointType): Promise<string> {
    return await this.getEndpointName(key);
  }

  async getS3PrivateBucketName(key: S3PrivateBucketNameType): Promise<string> {
    return await this.getValuePrivateBucketName(key);
  }

  async getS3PublicBucketName(key: S3BPublicBucketNameType): Promise<string> {
    return await this.getValuePublicBucketName(key);
  }

  async getS3RegionName(key: S3RegionNameType): Promise<string> {
    return await this.getValueRegionName(key);
  }
}
