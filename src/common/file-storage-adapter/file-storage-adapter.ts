import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FileUploadDto } from '../../features/blogger-blogs/dto/file-upload.dto';
import { CurrentUserDto } from '../../features/users/dto/current-user.dto';
import { S3Service } from '../../config/aws/s3/s3-service';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import {
  UrlPathKeyEtagDto,
  UrlsPathKeysEtagsDto,
} from '../../features/blogger-blogs/dto/url-pathKey-etag.dto';
import { BlogIdParams } from '../query/params/blogId.params';
import { UrlDto } from '../../features/blogger-blogs/dto/url.dto';
import * as uuid4 from 'uuid4';
import * as sharp from 'sharp';
import { ResizedImageDetailsDto } from '../../features/posts/dto/resized-image-details.dto';
import { KeysPathDto } from '../../features/posts/dto/keys-path.dto';
import { PathsKeysFileUploadDto } from '../../features/posts/dto/path-key-file-upload.dto';

@Injectable()
export class FileStorageAdapter {
  constructor(private s3Service: S3Service) {}

  async uploadFileImagePost(
    resizedImages: ResizedImageDetailsDto,
    pathsKeys: KeysPathDto,
  ): Promise<UrlsPathKeysEtagsDto> {
    const files: PathsKeysFileUploadDto =
      await this.createPathKeyFileUploadDtoArray(resizedImages, pathsKeys);

    return this.uploadFiles(files);
  }

  // async uploadFileImagePost(
  //   params: BlogIdPostIdParams,
  //   fileUploadDto: FileUploadDto,
  //   currentUserDto: CurrentUserDto,
  // ): Promise<UrlsPathKeysEtagsDto> {
  //   const { blogId, postId } = params;
  //   const { mimetype } = fileUploadDto;
  //
  //   const resizedImages: ResizedImageDetailsDto = await this.resizeImages(
  //     fileUploadDto,
  //   );
  //
  //   const pathsKeys: KeysPathDto = await this.generatePathsKeysForPost(
  //     currentUserDto.userId,
  //     blogId,
  //     postId,
  //     mimetype,
  //   );
  //
  //   const files: PathsKeysFileUploadDto =
  //     await this.createPathKeyFileUploadDtoArray(resizedImages, pathsKeys);
  //
  //   return this.uploadFiles(files);
  // }

  //
  // private async createPathKeyFileUploadDtoArray(
  //   resizedImages: ResizedImageDetailsDto,
  //   pathsKeys: KeysPathDto,
  // ): Promise<PathKeyFileUploadDto[]> {
  //   const pathKeyFileUploadDtoArray: PathKeyFileUploadDto[] = [];
  //
  //   for (const key of ['original', 'middle', 'small'] as const) {
  //     pathKeyFileUploadDtoArray.push({
  //       pathKey: pathsKeys[key],
  //       fileUploadDto: resizedImages[key],
  //     });
  //   }
  //
  //   return pathKeyFileUploadDtoArray;
  // }

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
        const resultUploaded: PutObjectCommandOutput = await s3Client.send(
          command,
        );
        const eTag = resultUploaded.ETag;

        if (!eTag) {
          console.error('Error uploading file to S3:');
          throw new InternalServerErrorException('Error uploading file to S3:');
        }

        const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
          pathKey,
        );
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

  // private async uploadFiles(
  //   files: PathsKeysFileUploadDto,
  // ): Promise<UrlsPathKeysEtagsDto> {
  //   try {
  //     const s3Client = await this.s3Service.getS3Client();
  //     const bucketName = await this.s3Service.getS3PublicBucketName();
  //     const uploadPromises: UrlPathKeyEtagDto[] = [];
  //
  //     for (const { pathKey, fileUploadDto } of files) {
  //       const { buffer, mimetype } = fileUploadDto;
  //       const bucketParams = {
  //         Bucket: bucketName,
  //         Key: pathKey,
  //         Body: buffer,
  //         ContentType: mimetype,
  //       };
  //       const command: PutObjectCommand = new PutObjectCommand(bucketParams);
  //       const resultUploaded: PutObjectCommandOutput = await s3Client.send(
  //         command,
  //       );
  //       const eTag = resultUploaded.ETag;
  //
  //       if (!eTag) {
  //         console.error('Error uploading file to S3:');
  //         throw new InternalServerErrorException('Error uploading file to S3:');
  //       }
  //
  //       const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
  //         pathKey,
  //       );
  //       uploadPromises.push({
  //         url: unitedUrl.url,
  //         pathKey: pathKey,
  //         eTag: eTag,
  //       });
  //     }
  //
  //     return await Promise.all(uploadPromises);
  //   } catch (error) {
  //     console.error('Error uploading files to S3:', error);
  //     throw new InternalServerErrorException(
  //       'Error uploading files to S3:' + error.message,
  //     );
  //   }
  // }

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
    return `content/users/${userId}/blogs/${blogId}_wallpaper.${this.getFileExtension(
      mimetype,
    )}`;
  }

  private async generateKeyForImagesBlogMain(
    userId: string,
    blogId: string,
    mimetype: string,
  ): Promise<string> {
    return `content/users/${userId}/blogs/${blogId}_main.${this.getFileExtension(
      mimetype,
    )}`;
  }

  async resizeImages(dto: FileUploadDto): Promise<ResizedImageDetailsDto> {
    // Resize original image to middle size (300x180)
    const middleResizedImageBuffer = await sharp(dto.buffer)
      .resize(300, 180)
      .toBuffer();

    // Resize original image to small size (149x96)
    const smallResizedImageBuffer = await sharp(dto.buffer)
      .resize(149, 96)
      .toBuffer();

    return {
      original: {
        fieldname: dto.fieldname,
        originalname: dto.originalname,
        encoding: dto.encoding,
        mimetype: dto.mimetype,
        buffer: dto.buffer,
        size: dto.size,
      },
      middle: {
        fieldname: dto.fieldname,
        originalname: dto.originalname,
        encoding: dto.encoding,
        mimetype: dto.mimetype,
        buffer: middleResizedImageBuffer,
        size: middleResizedImageBuffer.length,
      },
      small: {
        fieldname: dto.fieldname,
        originalname: dto.originalname,
        encoding: dto.encoding,
        mimetype: dto.mimetype,
        buffer: smallResizedImageBuffer,
        size: smallResizedImageBuffer.length,
      },
    };
  }

  private async getFileExtension(mimetype: string): Promise<string> {
    return mimetype.split('/').pop() || '';
  }
}
