import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../views/post.view-model';
import {
  ExtendedLikesInfo,
  PostWithLikesInfoViewModel,
} from '../views/post-with-likes-info.view-model';
import { PostWithLikesImagesInfoViewModel } from '../views/post-with-likes-images-info.view-model';
import { PostImagesViewModel } from '../views/post-images.view-model';
import { PathKeyBufferDto } from '../dto/path-key-buffer.dto';
import { FilesMetadataService } from '../../../adapters/media-services/files/files-metadata.service';

@Injectable()
export class PostsService {
  constructor(protected imagesMetadataService: FilesMetadataService) {}

  async mapPostsWithLikesAndImagesMetadata(
    posts: PostWithLikesInfoViewModel[],
    imagesMetadata: { [postId: string]: PathKeyBufferDto[] }[],
  ): Promise<PostWithLikesImagesInfoViewModel[]> {
    // Map posts to promises of their respective view models with image metadata
    const resultPromises = posts.map(
      async (post: PostWithLikesInfoViewModel) => {
        const postId = post.id;
        const images: PathKeyBufferDto[] =
          imagesMetadata.find((entry) => entry[postId])?.[postId] || [];

        // Retrieve metadata for files
        const metadataPromise: PostImagesViewModel =
          await this.imagesMetadataService.imagesPostsMetadataProcessor(images);
        return { post, metadataPromise };
      },
    );

    // Wait for all promises to resolve
    const results = await Promise.all(resultPromises);

    // Map results to post view models with image metadata
    return Promise.all(
      results.map(async ({ post, metadataPromise }) => {
        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: post.extendedLikesInfo,
          images: {
            main: metadataPromise.main,
          },
        };
      }),
    );
  }

  async addExtendedLikesInfoToPostsEntity(
    newPost: PostViewModel,
  ): Promise<PostWithLikesInfoViewModel> {
    const extendedLikesInfo = new ExtendedLikesInfo();
    return {
      ...newPost, // Spread properties of newPost
      extendedLikesInfo, // Add extendedLikesInfo property
    };
  }
}
