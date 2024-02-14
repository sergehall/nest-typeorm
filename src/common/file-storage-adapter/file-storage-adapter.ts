import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlogIdPostIdParams } from '../query/params/blogId-postId.params';
import { FileUploadDtoDto } from '../../features/blogger-blogs/dto/file-upload.dto';
import { CurrentUserDto } from '../../features/users/dto/current-user.dto';
import { S3Service } from '../../config/aws/s3/s3-service';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { UrlEtagDto } from '../../features/blogger-blogs/dto/url-etag.dto';
import { BlogIdParams } from '../query/params/blogId.params';
import { UrlDto } from '../../features/blogger-blogs/dto/url.dto';

@Injectable()
export class FileStorageAdapter {
  constructor(private s3Service: S3Service) {}

  async uploadFileImagePost(
    params: BlogIdPostIdParams,
    fileUploadDto: FileUploadDtoDto,
    currentUserDto: CurrentUserDto,
  ): Promise<UrlEtagDto> {
    const { blogId, postId } = params;
    const { mimetype } = fileUploadDto;
    const key = this.generateKeyForImagesPost(
      currentUserDto.userId,
      blogId,
      postId,
      mimetype,
    );
    return this.uploadFile(key, fileUploadDto);
  }

  async uploadFileImageBlogWallpaper(
    params: BlogIdParams,
    fileUploadDto: FileUploadDtoDto,
    currentUserDto: CurrentUserDto,
  ): Promise<UrlEtagDto> {
    const { blogId } = params;
    const { mimetype } = fileUploadDto;
    const key = this.generateKeyForImagesBlogWallpaper(
      currentUserDto.userId,
      blogId,
      mimetype,
    );
    return this.uploadFile(key, fileUploadDto);
  }

  async uploadFileImageBlogMain(
    params: BlogIdParams,
    fileUploadDto: FileUploadDtoDto,
    currentUserDto: CurrentUserDto,
  ): Promise<UrlEtagDto> {
    const { blogId } = params;
    const { mimetype } = fileUploadDto;
    const key = this.generateKeyForImagesBlogMain(
      currentUserDto.userId,
      blogId,
      mimetype,
    );
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

    const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(key);

    try {
      return { url: unitedUrl.url, eTag: eTag };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException(
        'Error uploading file to S3:' + error.message,
      );
    }
  }

  private generateKeyForImagesPost(
    userId: string,
    blogId: string,
    postId: string,
    mimetype: string,
  ): string {
    return `content/users/${userId}/blogs/${blogId}/posts/${postId}_post.${this.getFileExtension(
      mimetype,
    )}`;
  }

  private generateKeyForImagesBlogWallpaper(
    userId: string,
    blogId: string,
    mimetype: string,
  ): string {
    return `content/users/${userId}/blogs/${blogId}_wallpaper.${this.getFileExtension(
      mimetype,
    )}`;
  }

  private generateKeyForImagesBlogMain(
    userId: string,
    blogId: string,
    mimetype: string,
  ): string {
    return `content/users/${userId}/blogs/${blogId}_main.${this.getFileExtension(
      mimetype,
    )}`;
  }

  private getFileExtension(mimetype: string): string {
    return mimetype.split('/').pop() || '';
  }
}
