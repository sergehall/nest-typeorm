import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { AwsConfig } from '../../../config/aws/aws-config';

@Injectable()
export class S3StorageAdapter {
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucketName: string;
  private s3Client: S3Client;

  constructor(private readonly awsConfig: AwsConfig) {
    this.initialize();
  }

  async saveImageForPost(
    userId: string,
    oridginalName: string,
    buffer: Buffer,
  ) {
    const bucketParams = {
      Bucket: this.bucketName,
      Key: `content/users/${userId}/avatars/${userId}_avatar.jpeg`,
      Body: buffer,
      ContentType: 'images/png',
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult: PutObjectCommandOutput = await this.s3Client.send(
        command,
      );
      console.log(uploadResult);
      return uploadResult.$metadata;
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }

  private async initialize(): Promise<void> {
    try {
      this.accessKeyId = await this.awsConfig.getAccessKeyId('ACCESS_KEY_ID');
      this.secretAccessKey = await this.awsConfig.getSecretAccessKey(
        'SECRET_ACCESS_KEY',
      );
      this.bucketName = await this.awsConfig.getBucketName('BUCKET_HALL_AWS');

      this.s3Client = new S3Client({
        endpoint: 's3-accesspoint.us-east-2.amazonaws.com',
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });
    } catch (error) {
      // Handle any errors that occur during initialization
      console.error('Error initializing S3StorageAdapter:', error);
      // You might want to throw an exception or handle the error accordingly
    }
  }

  // Now you can use this.s3Client to interact with AWS S3 in your methods
}
