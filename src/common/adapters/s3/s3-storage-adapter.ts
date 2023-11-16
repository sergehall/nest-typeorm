import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageAdapter {
  constructor() {
    const client = new S3Client({
      endpoint: 's3-accesspoint.us-east-2.amazonaws.com',
      credentials: {
        accessKeyId: '',
        secretAccessKey: 'secretAccessKey',
      },
    });
  }
}
