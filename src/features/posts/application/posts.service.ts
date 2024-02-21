import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../views/post.view-model';
import {
  ExtendedLikesInfo,
  PostWithLikesInfoViewModel,
} from '../views/post-with-likes-info.view-model';
import { PostWithLikesImagesInfoViewModel } from '../views/post-with-likes-images-info.view-model';
import {
  PostImages,
  PostImagesViewModel,
} from '../views/post-images.view-model';
import { FileMetadata } from '../../../common/helpers/file-metadata-from-buffer.service/dto/file-metadata';
import { FileMetadataService } from '../../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { UrlDto } from '../../blogger-blogs/dto/url.dto';
import { S3Service } from '../../../config/aws/s3/s3-service';
import { ImagesPostsOriginalMetadataEntity } from '../entities/images-post-original-metadata.entity';
import { OriginalMiddleSmallEntitiesDto } from '../dto/original-middle-small-entities.dto';
import { ImagesPostsPathKeyBufferDto } from '../dto/images-posts-path-key-buffer.dto';

@Injectable()
export class PostsService {
  constructor(
    protected fileMetadataService: FileMetadataService,
    protected s3Service: S3Service,
  ) {}

  async addExtendedLikesInfoToPostsEntity(
    newPost: PostViewModel,
  ): Promise<PostWithLikesInfoViewModel> {
    const extendedLikesInfo = new ExtendedLikesInfo();
    return {
      ...newPost, // Spread properties of newPost
      extendedLikesInfo, // Add extendedLikesInfo property
    };
  }

  async postsImagesAggregation() {
    return true;
  }

  async addPostImages(
    newPost: PostWithLikesInfoViewModel,
  ): Promise<PostWithLikesImagesInfoViewModel> {
    const images = new PostImagesViewModel();
    return {
      ...newPost, // Spread properties of newPost
      images: images, // Add images property
    };
  }

  async imagesMetadataProcessorNew(
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
        this.processMetadata(original),
        this.processMetadata(middle),
        this.processMetadata(small),
      ],
    );

    // Combine all processed metadata into an array
    // Construct the main property of PostImagesViewModel
    const main: PostImages[] = [
      { ...originalMetadata[0] },
      { ...middleMetadata[0] },
      { ...smallMetadata[0] },
    ];

    return { main };
  }

  async processMetadata(
    metadata: ImagesPostsOriginalMetadataEntity,
  ): Promise<PostImages[]> {
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
    imagesMetadata: ImagesPostsPathKeyBufferDto[],
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

  // async imagesMetadataProcessor(
  //   imagesMetadata: ImagesPostsOriginalMetadataEntity[],
  // ): Promise<PostImagesViewModel> {
  //   if (imagesMetadata.length === 0) {
  //     return { main: [] };
  //   }
  //   const processedMetadataPromises = imagesMetadata.map(async (metadata) => {
  //     // Extract file metadata
  //     const imageMetadata: FileMetadata =
  //       await this.fileMetadataService.extractFromBuffer(metadata.buffer);
  //
  //     const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
  //       metadata.pathKey,
  //     );
  //
  //     return {
  //       url: unitedUrl.url, // Assuming pathKey contains the URL of the image
  //       width: imageMetadata.width, // Assuming width is a property of the metadata
  //       height: imageMetadata.height, // Assuming height is a property of the metadata
  //       fileSize: imageMetadata.fileSize, // Assuming size represents the file size of the image
  //     };
  //   });
  //
  //   const processedMetadata = await Promise.all(processedMetadataPromises);
  //
  //   return { main: processedMetadata };
  // }
}
