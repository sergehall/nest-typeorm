import { Injectable } from '@nestjs/common';
import { BlogIdPostIdParams } from '../../query/params/blogId-postId.params';
import { FileUploadDtoDto } from '../../../features/blogger-blogs/dto/file-upload.dto';
import { CurrentUserDto } from '../../../features/users/dto/current-user.dto';
import { AwsConfig } from '../../../config/aws/aws-config';
import { S3Service } from '../service/s3-service';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';

@Injectable()
export class FileStorageAdapter {
  constructor(protected awsConfig: AwsConfig, private s3Service: S3Service) {}

  /**
   * Uploads a file to AWS S3 for a specific blog post.
   * @param params Parameters identifying the blog post.
   * @param fileUploadDto Information about the file to upload.
   * @param currentUserDto Information about the current user.
   * @returns Information about the uploaded object.
   */
  async uploadFileForPost(
    params: BlogIdPostIdParams,
    fileUploadDto: FileUploadDtoDto,
    currentUserDto: CurrentUserDto,
  ): Promise<PutObjectCommandOutput> {
    const { blogId, postId } = params;
    const { buffer, mimetype } = fileUploadDto;
    const fileExtension = await this.getFileExtension(mimetype);
    const s3Client = await this.s3Service.getS3Client();
    const bucketName = await this.s3Service.getS3BucketName();
    console.log(mimetype, 'mimetype');
    console.log(fileExtension, 'fileExtension');
    const bucketParams = {
      Bucket: bucketName,
      Key: `content/users/${currentUserDto.userId}/blog/${blogId}/post/${postId}_post.${fileExtension}`,
      Body: buffer,
      ContentType: mimetype,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      return await s3Client.send(command);
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  /**
   * Generates a unique key for the uploaded file based on its original name.
   * @param originalname Original name of the uploaded file.
   * @returns Unique key for the file.
   */
  private async getFileExtension(originalname: string): Promise<string> {
    const parts = originalname.split('/');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  /**
   * Retrieves the name of the S3 bucket to use for file storage.
   * This could be fetched from a configuration or determined dynamically.
   * For demonstration purposes, this method returns a hardcoded bucket name.
   * @returns Name of the S3 bucket.
   */
  private async getBucketName(): Promise<string> {
    // For demonstration purposes, return a hardcoded bucket name
    return 'your-bucket-name';
  }
}
