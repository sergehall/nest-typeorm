import { Injectable } from '@nestjs/common';
import { PostWithLikesInfoViewModel } from '../../posts/views/post-with-likes-info.view-model';
import { PostWithLikesImagesInfoViewModel } from '../../posts/views/post-with-likes-images-info.view-model';
import {
  ImageMetadata,
  PostImagesViewModel,
} from '../../posts/views/post-images.view-model';
import { OriginalMiddleSmallEntitiesDto } from '../../posts/dto/original-middle-small-entities.dto';
import { ImagesPostsMetadataEntity } from '../../posts/dto/images-posts-metadata.dto';
import { FileMetadata } from '../../../common/helpers/file-metadata-from-buffer.service/dto/file-metadata';
import { UrlDto } from '../dto/url.dto';
import { PathKeyBufferDto } from '../../posts/dto/path-key-buffer.dto';
import { FileMetadataService } from '../../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { S3Service } from '../../../config/aws/s3/s3-service';

@Injectable()
export class ImagesMetadataService {
  constructor(
    protected fileMetadataService: FileMetadataService,
    protected s3Service: S3Service,
  ) {}

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
    const imageMetadata: FileMetadata =
      await this.fileMetadataService.extractFromBuffer(metadata.buffer);

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
      const imageMetadata: FileMetadata =
        await this.fileMetadataService.extractFromBuffer(metadata.buffer);

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
      images: images, // Add images property
    };
  }
}
