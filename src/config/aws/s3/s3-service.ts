import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';
import { AwsConfig } from '../aws-config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private readonly awsConfig: AwsConfig) {
    this.initializeS3Client();
  }

  /**
   * Initializes the S3 client with configuration from AwsConfig.
   */
  private async initializeS3Client(): Promise<void> {
    try {
      const bucketName = await this.getS3BucketName();
      if (!(await this.bucketExists(bucketName))) {
        await this.createBucket(bucketName);
      }

      const accessKeyId = await this.awsConfig.getAccessKeyId('ACCESS_KEY_ID');
      const secretAccessKey = await this.awsConfig.getSecretAccessKey(
        'SECRET_ACCESS_KEY',
      );
      const endpoint = await this.awsConfig.getEndpoint('AWS_ENDPOINT');
      const region = await this.awsConfig.getS3RegionName('S3_REGION');

      this.s3Client = new S3Client({
        endpoint,
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error initializing S3 client:' + error.message,
      );
    }
  }

  /**
   * Checks if the specified S3 bucket exists.
   * @param bucketName Name of the S3 bucket.
   * @returns True if the bucket exists, false otherwise.
   */
  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      // await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      } else {
        console.error('Error checking bucket existence:', error);
        throw new InternalServerErrorException(
          'Error checking bucket existence:' + error.message,
        );
      }
    }
  }

  /**
   * Creates a new S3 bucket.
   * @param bucketName Name of the new bucket.
   */
  async createBucket(bucketName: string): Promise<void> {
    const params = { Bucket: bucketName };

    try {
      await this.s3Client.send(new CreateBucketCommand(params));
    } catch (error) {
      console.error('Error creating S3 bucket:', error);
      throw new InternalServerErrorException(
        'Error creating S3 bucket:' + error.message,
      );
    }
  }

  /**
   * Getter method to return the S3 client instance.
   * @returns S3Client instance.
   */
  async getS3Client(): Promise<S3Client> {
    return this.s3Client;
  }

  async getAWSEndpoint(): Promise<string> {
    return await this.awsConfig.getEndpoint('AWS_ENDPOINT');
  }

  async getS3BucketName(): Promise<string> {
    try {
      return await this.awsConfig.getS3BucketName('S3_BUCKET');
    } catch (error) {
      console.error('Error fetching S3 bucket name:', error);
      throw new InternalServerErrorException(
        'Error fetching S3 bucket name:' + error.message,
      );
    }
  }
}
