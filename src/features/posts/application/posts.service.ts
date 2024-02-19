import { Injectable } from '@nestjs/common';
import { PostViewModel } from '../views/post.view-model';
import {
  ExtendedLikesInfo,
  PostWithLikesInfoViewModel,
} from '../views/post-with-likes-info.view-model';
import { PostWithLikesImagesInfoViewModel } from '../views/post-with-likes-images-info.view-model';
import { PostImagesViewModel } from '../../blogger-blogs/views/post-images.view-model';

@Injectable()
export class PostsService {
  constructor() {}

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
}
