import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../views/post.view-model';
import {
  ExtendedLikesInfo,
  PostWithLikesInfoViewModel,
} from '../views/post-with-likes-info.view-model';
import { PostWithLikesImagesInfoViewModel } from '../views/post-with-likes-images-info.view-model';
import { PostImagesViewModel } from '../views/post-images.view-model';
import { ImagesPostsMetadataEntity } from '../entities/images-post-metadata.entity';
import { FileMetadata } from '../../../common/helpers/file-metadata-from-buffer.service/dto/file-metadata';
import { FileMetadataService } from '../../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { UrlDto } from '../../blogger-blogs/dto/url.dto';
import { S3Service } from '../../../config/aws/s3/s3-service';

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

  async addPostImages(
    newPost: PostWithLikesInfoViewModel,
  ): Promise<PostWithLikesImagesInfoViewModel> {
    const images = new PostImagesViewModel();
    return {
      ...newPost, // Spread properties of newPost
      images: images, // Add images property
    };
  }

  async imagesMetadataProcessor(
    imagesMetadata: ImagesPostsMetadataEntity[],
  ): Promise<PostImagesViewModel> {
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
}
