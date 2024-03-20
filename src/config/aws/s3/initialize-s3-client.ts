import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';
import { AwsConfig } from '../aws.config';
import { UrlDto } from '../../../features/blogger-blogs/dto/url.dto';

@Injectable()
export class InitializeS3Client {
  private s3Client: S3Client;

  constructor(private readonly awsConfig: AwsConfig) {
    this.initializeS3Client();
  }

  /**
   * Initializes the S3 client with configuration from AwsConfig.
   */
  private async initializeS3Client(): Promise<void> {
    try {
      const privateBucketName = await this.getS3PrivateBucketName();
      const publicBucketName = await this.getS3PublicBucketName();
      if (!(await this.bucketExists(privateBucketName))) {
        await this.createBucket(privateBucketName);
      }
      if (!(await this.bucketExists(publicBucketName))) {
        await this.createBucket(publicBucketName);
      }

      const accessKeyId = await this.awsConfig.getAwsConfig('ACCESS_KEY_ID');
      const secretAccessKey =
        await this.awsConfig.getAwsConfig('SECRET_ACCESS_KEY');
      const endpoint = await this.awsConfig.getAwsConfig('AWS_ENDPOINT');
      const region = await this.awsConfig.getAwsConfig('S3_REGION');

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

  async getS3PrivateBucketName(): Promise<string> {
    try {
      return await this.awsConfig.getAwsConfig('S3_PRIVATE_BUCKET');
    } catch (error) {
      console.error('Error fetching S3 bucket name:', error);
      throw new InternalServerErrorException(
        'Error fetching S3 bucket name:' + error.message,
      );
    }
  }

  async getS3PublicBucketName(): Promise<string> {
    try {
      return await this.awsConfig.getAwsConfig('S3_PUBLIC_BUCKET');
    } catch (error) {
      console.error('Error fetching S3 bucket name:', error);
      throw new InternalServerErrorException(
        'Error fetching S3 bucket name:' + error.message,
      );
    }
  }

  async generateSignedUrl(key: string): Promise<UrlDto> {
    try {
      const baseUrl = await this.awsConfig.getAwsConfig('AWS_ENDPOINT');
      // const subDomain = await this.awsConfig.getS3BucketName('S3_BUCKET');
      const subDomain = await this.awsConfig.getAwsConfig('S3_PUBLIC_BUCKET');

      // Splitting baseUrl by protocol separator
      const parts = baseUrl.split('//');

      // Extracting protocol and domain
      const protocol = parts[0];
      const domain = parts[1];

      // Concatenating subDomain in between
      return { url: `${protocol}//${subDomain}.${domain}/${key}` };
    } catch (error) {
      // Handle errors here
      console.error('Error uniteStrings:', error);
      throw new InternalServerErrorException(
        'Error uniteStrings:' + error.message,
      );
    }
  }
}
