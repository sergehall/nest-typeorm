import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PostWithLikesInfoViewModel } from '../../../features/posts/views/post-with-likes-info.view-model';
import { PostWithLikesImagesInfoViewModel } from '../../../features/posts/views/post-with-likes-images-info.view-model';
import { PostImagesViewModel } from '../../../features/posts/views/post-images.view-model';
import { OriginalMiddleSmallEntitiesDto } from '../../../features/posts/dto/original-middle-small-entities.dto';
import { ImagesPostsMetadataEntity } from '../../../features/posts/dto/images-posts-metadata.dto';
import { UrlDto } from '../../../features/blogger-blogs/dto/url.dto';
import { PathKeyBufferDto } from '../../../features/posts/dto/path-key-buffer.dto';
import { S3Service } from '../../../config/aws/s3/s3-service';
import * as sharp from 'sharp';
import { ImageWidthHeightSize } from './dto/image-width-height-size';
import { ImageMetadata } from './dto/image-metadata';
import { FileUploadDto } from '../../../features/blogger-blogs/dto/file-upload.dto';
import { ResizedImageDetailsDto } from '../../../features/posts/dto/resized-image-details.dto';

@Injectable()
export class FilesMetadataService {
  constructor(protected s3Service: S3Service) {}

  async resizeImages(dto: FileUploadDto): Promise<ResizedImageDetailsDto> {
    const [middleResizedImage, smallResizedImage] = await Promise.all([
      this.resizeImage(dto.buffer, 300, 180),
      this.resizeImage(dto.buffer, 149, 96),
    ]);

    return {
      original: { ...dto, size: dto.buffer.length },
      middle: {
        ...dto,
        buffer: middleResizedImage.buffer,
        size: middleResizedImage.size,
      },
      small: {
        ...dto,
        buffer: smallResizedImage.buffer,
        size: smallResizedImage.size,
      },
    };
  }

  private async resizeImage(
    buffer: Buffer,
    width: number,
    height: number,
  ): Promise<{ buffer: Buffer; size: number }> {
    const resizedImageBuffer = await sharp(buffer)
      .resize(width, height)
      .toBuffer();

    return {
      buffer: resizedImageBuffer,
      size: resizedImageBuffer.length,
    };
  }

  async extractWidthHeightSizeFromBuffer(
    buffer: Buffer,
  ): Promise<ImageWidthHeightSize> {
    try {
      const metadata = await sharp(buffer).metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      const fileSize = metadata.size || 0;

      return { width, height, fileSize };
    } catch (error) {
      console.error('Error extracting file metadata:', error);
      throw new InternalServerErrorException(
        'Error extracting file metadata:' + error.message,
      );
    }
  }

  async processImageMetadata(
    imagesMetadata: OriginalMiddleSmallEntitiesDto,
  ): Promise<PostImagesViewModel> {
    if (!imagesMetadata) {
      return { main: [] };
    }

    // Destructure the object to access original, middle, and small metadata
    const { original, middle, small } = imagesMetadata;

    // Process all types of metadata concurrently
    const [originalMetadata, middleMetadata, smallMetadata] = await Promise.all(
      [
        this.imageMetadataProcessor(original),
        this.imageMetadataProcessor(middle),
        this.imageMetadataProcessor(small),
      ],
    );

    // Combine all processed metadata into an array
    // Construct the main property of PostImagesViewModel
    const main: ImageMetadata[] = [
      { ...originalMetadata[0] },
      { ...middleMetadata[0] },
      { ...smallMetadata[0] },
    ];

    return { main };
  }

  async imageMetadataProcessor(
    metadata: ImagesPostsMetadataEntity,
  ): Promise<ImageMetadata[]> {
    const imageMetadata: ImageWidthHeightSize =
      await this.extractWidthHeightSizeFromBuffer(metadata.buffer);

    const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
      metadata.pathKey,
    );

    return [
      {
        url: unitedUrl.url,
        width: imageMetadata.width,
        height: imageMetadata.height,
        fileSize: imageMetadata.fileSize,
      },
    ];
  }

  async imagesMetadataProcessor(
    imagesMetadata: PathKeyBufferDto[],
  ): Promise<PostImagesViewModel> {
    if (imagesMetadata.length === 0) {
      return { main: [] };
    }
    const processedMetadataPromises = imagesMetadata.map(async (metadata) => {
      // Extract file metadata
      const imageMetadata: ImageWidthHeightSize =
        await this.extractWidthHeightSizeFromBuffer(metadata.buffer);

      const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
        metadata.pathKey,
      );

      return {
        url: unitedUrl.url, // Assuming pathKey contains the URL of the image
        width: imageMetadata.width, // Assuming width is a property of the metadata
        height: imageMetadata.height, // Assuming height is a property of the metadata
        fileSize: imageMetadata.fileSize, // Assuming size represents the file size of the image
      };
    });

    const processedMetadata = await Promise.all(processedMetadataPromises);

    return { main: processedMetadata };
  }
  async addImagesToPostModel(
    newPost: PostWithLikesInfoViewModel,
  ): Promise<PostWithLikesImagesInfoViewModel> {
    const images = new PostImagesViewModel();
    return {
      ...newPost, // Spread properties of newPost
      images: images, // Add files property
    };
  }
}