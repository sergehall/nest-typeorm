import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FileUploadDto } from '../../features/blogger-blogs/dto/file-upload.dto';
import { CurrentUserDto } from '../../features/users/dto/current-user.dto';
import { InitializeS3Client } from '../../config/aws/s3/initialize-s3-client';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import {
  UrlPathKeyEtagDto,
  UrlsPathKeysEtagsDto,
} from '../../features/blogger-blogs/dto/url-pathKey-etag.dto';
import { BlogIdParams } from '../../common/query/params/blogId.params';
import { UrlDto } from '../../features/blogger-blogs/dto/url.dto';
import { ResizedImageDetailsDto } from '../../features/posts/dto/resized-image-details.dto';
import { KeysPathDto } from '../../features/posts/dto/keys-path.dto';
import { PathsKeysFileUploadDto } from '../../features/posts/dto/path-key-file-upload.dto';

@Injectable()
export class FilesStorageAdapter {
  constructor(private s3Service: InitializeS3Client) {}

  async uploadFileImagePost(
    resizedImages: ResizedImageDetailsDto,
    pathsKeys: KeysPathDto,
  ): Promise<UrlsPathKeysEtagsDto> {
    const files: PathsKeysFileUploadDto =
      await this.createPathKeyFileUploadDtoArray(resizedImages, pathsKeys);

    return this.uploadFiles(files);
  }

  private async createPathKeyFileUploadDtoArray(
    resizedImages: ResizedImageDetailsDto,
    pathsKeys: KeysPathDto,
  ): Promise<PathsKeysFileUploadDto> {
    const pathKeyFileUploadDtoObj: PathsKeysFileUploadDto =
      new PathsKeysFileUploadDto();

    for (const key of ['original', 'middle', 'small'] as const) {
      const pathKey = pathsKeys[key];
      const fileUploadDto = resizedImages[key];

      // Assign the PathKeyFileUploadDto object to the corresponding property in PathsKeysFileUploadDto
      pathKeyFileUploadDtoObj[key] = {
        pathKey,
        fileUploadDto,
      };
    }

    return pathKeyFileUploadDtoObj;
  }

  private async uploadFiles(
    files: PathsKeysFileUploadDto,
  ): Promise<UrlsPathKeysEtagsDto> {
    try {
      const s3Client = await this.s3Service.getS3Client();
      const bucketName = await this.s3Service.getS3PublicBucketName();

      const uploadPromises: Promise<UrlPathKeyEtagDto>[] = Object.keys(
        files,
      ).map(async (size: 'original' | 'middle' | 'small') => {
        const { pathKey, fileUploadDto } = files[size];

        const { buffer, mimetype } = fileUploadDto;
        const bucketParams = {
          Bucket: bucketName,
          Key: pathKey,
          Body: buffer,
          ContentType: mimetype,
        };
        const command: PutObjectCommand = new PutObjectCommand(bucketParams);
        const resultUploaded: PutObjectCommandOutput =
          await s3Client.send(command);
        const eTag = resultUploaded.ETag;

        if (!eTag) {
          console.error('Error uploading file to S3:');
          throw new InternalServerErrorException('Error uploading file to S3:');
        }

        const unitedUrl: UrlDto =
          await this.s3Service.generateSignedUrl(pathKey);
        return {
          url: unitedUrl.url,
          pathKey: pathKey,
          eTag: eTag,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      return {
        original: uploadedFiles[0],
        middle: uploadedFiles[1],
        small: uploadedFiles[2],
      };
    } catch (error) {
      console.error('Error uploading files to S3:', error);
      throw new InternalServerErrorException(
        'Error uploading files to S3:' + error.message,
      );
    }
  }

  async uploadFileImageBlogWallpaper(
    params: BlogIdParams,
    fileUploadDto: FileUploadDto,
    currentUserDto: CurrentUserDto,
  ): Promise<UrlPathKeyEtagDto> {
    const { blogId } = params;
    const { mimetype } = fileUploadDto;
    const pathKey = await this.generateKeyForImagesBlogWallpaper(
      currentUserDto.userId,
      blogId,
      mimetype,
    );

    return this.uploadFile(pathKey, fileUploadDto);
  }

  async uploadFileImageBlogMain(
    params: BlogIdParams,
    fileUploadDto: FileUploadDto,
    currentUserDto: CurrentUserDto,
  ): Promise<UrlPathKeyEtagDto> {
    const { blogId } = params;
    const { mimetype } = fileUploadDto;
    const pathKey = await this.generateKeyForImagesBlogMain(
      currentUserDto.userId,
      blogId,
      mimetype,
    );
    return this.uploadFile(pathKey, fileUploadDto);
  }

  private async uploadFile(
    pathKey: string,
    fileUploadDto: FileUploadDto,
  ): Promise<UrlPathKeyEtagDto> {
    const { buffer, mimetype } = fileUploadDto;
    const s3Client = await this.s3Service.getS3Client();
    // const bucketName = await this.s3Service.getS3BucketName();
    const bucketName = await this.s3Service.getS3PublicBucketName();

    const bucketParams = {
      Bucket: bucketName,
      Key: pathKey,
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

    const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(pathKey);

    try {
      return { url: unitedUrl.url, pathKey: pathKey, eTag: eTag };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException(
        'Error uploading file to S3:' + error.message,
      );
    }
  }

  async generatePathsKeysForPost(
    userId: string,
    blogId: string,
    postId: string,
    mimetype: string,
  ): Promise<KeysPathDto> {
    const extensionFile = await this.getFileExtension(mimetype);
    return {
      original: `content/users/${userId}/blogs/${blogId}/posts/${postId}_post_original.${extensionFile}`,
      middle: `content/users/${userId}/blogs/${blogId}/posts/${postId}_post_middle.${extensionFile}`,
      small: `content/users/${userId}/blogs/${blogId}/posts/${postId}_post_small.${extensionFile}`,
    };
  }

  private async generateKeyForImagesBlogWallpaper(
    userId: string,
    blogId: string,
    mimetype: string,
  ): Promise<string> {
    return `content/users/${userId}/blogs/${blogId}_wallpaper.${await this.getFileExtension(
      mimetype,
    )}`;
  }

  private async generateKeyForImagesBlogMain(
    userId: string,
    blogId: string,
    mimetype: string,
  ): Promise<string> {
    return `content/users/${userId}/blogs/${blogId}_main.${await this.getFileExtension(
      mimetype,
    )}`;
  }

  private async getFileExtension(mimetype: string): Promise<string> {
    return mimetype.split('/').pop() || '';
  }
}
