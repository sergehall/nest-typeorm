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

  async uploadFileImagePost(
    params: BlogIdPostIdParams,
    fileUploadDto: FileUploadDtoDto,
    currentUserDto: CurrentUserDto,
  ): Promise<UrlEtagDto> {
    const { blogId, postId } = params;
    const key = this.generateKeyForPostFile(
      currentUserDto.userId,
      blogId,
      postId,
    );
    return this.uploadFile(key, fileUploadDto);
  }

  async uploadFileImageBlogWallpaper(
    params: BlogIdParams,
    fileUploadDto: FileUploadDtoDto,
    currentUserDto: CurrentUserDto,
  ): Promise<UrlEtagDto> {
    const { blogId } = params;
    const key = this.generateKeyForWallpaperFile(currentUserDto.userId, blogId);
    return this.uploadFile(key, fileUploadDto);
  }

  private async uploadFile(
    key: string,
    fileUploadDto: FileUploadDtoDto,
  ): Promise<UrlEtagDto> {
    const { buffer, mimetype } = fileUploadDto;
    const s3Client = await this.s3Service.getS3Client();
    const bucketName = await this.s3Service.getS3BucketName();

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

  private generateKeyForPostFile(
    userId: string,
    blogId: string,
    postId: string,
  ): string {
    return `content/users/${userId}/blogs/${blogId}/posts/${postId}_post.${this.getFileExtension(
      postId,
    )}`;
  }

  private generateKeyForWallpaperFile(userId: string, blogId: string): string {
    return `content/users/${userId}/blogs/${blogId}_wallpaper.${this.getFileExtension(
      blogId,
    )}`;
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }
}
