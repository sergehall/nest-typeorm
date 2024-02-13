import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlogIdPostIdParams } from '../query/params/blogId-postId.params';
import { FileUploadDtoDto } from '../../features/blogger-blogs/dto/file-upload.dto';
import { CurrentUserDto } from '../../features/users/dto/current-user.dto';
import { S3Service } from '../../config/aws/s3/s3-service';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { UrlEtagDto } from '../../features/blogger-blogs/dto/url-etag.dto';
import { BlogIdParams } from '../query/params/blogId.params';

@Injectable()
export class FileStorageAdapter {
  constructor(private s3Service: S3Service) {}

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
  ): Promise<UrlEtagDto> {
    const { blogId, postId } = params;
    const { buffer, mimetype } = fileUploadDto;
    const fileExtension = await this.getFileExtension(mimetype);
    const s3Client = await this.s3Service.getS3Client();
    const bucketName = await this.s3Service.getS3BucketName();
    const key = `content/users/${currentUserDto.userId}/blogs/${blogId}/posts/${postId}_post.${fileExtension}`;

    const bucketParams = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    const command: PutObjectCommand = new PutObjectCommand(bucketParams);
    const resultUploaded: PutObjectCommandOutput = await s3Client.send(command);
    const eTag = resultUploaded.ETag;
    if (!eTag) {
      console.error('Error uploading file to S3:');
      throw new InternalServerErrorException('Error uploading file to S3:');
    }
    try {
      return { url: key, eTag: eTag };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException(
        'Error uploading file to S3:' + error.message,
      );
    }
  }

  /**
   * Uploads a file to AWS S3 for a specific blog post.
   * @param params Parameters identifying the blog post.
   * @param fileUploadDto Information about the file to upload.
   * @param currentUserDto Information about the current user.
   * @returns Information about the uploaded object.
   */
  async uploadFileImageBlogWallpaper(
    params: BlogIdParams,
    fileUploadDto: FileUploadDtoDto,
    currentUserDto: CurrentUserDto,
  ): Promise<UrlEtagDto> {
    const { blogId } = params;
    const { buffer, mimetype } = fileUploadDto;
    const fileExtension = await this.getFileExtension(mimetype);
    const s3Client = await this.s3Service.getS3Client();
    const bucketName = await this.s3Service.getS3BucketName();
    const key = `content/users/${currentUserDto.userId}/blogs/${blogId}_wallpaper.${fileExtension}`;

    const bucketParams = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    const command: PutObjectCommand = new PutObjectCommand(bucketParams);
    const resultUploaded: PutObjectCommandOutput = await s3Client.send(command);
    const eTag = resultUploaded.ETag;
    if (!eTag) {
      console.error('Error uploading file to S3:');
      throw new InternalServerErrorException('Error uploading file to S3:');
    }
    try {
      return { url: key, eTag: eTag };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException(
        'Error uploading file to S3:' + error.message,
      );
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
}
