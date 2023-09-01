import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { PostsRepo } from '../../features/posts/infrastructure/posts-repo';
import { PostsEntity } from '../../features/posts/entities/posts.entity';

@Injectable()
export class PostExistValidationPipe implements PipeTransform {
  constructor(private postsRepo: PostsRepo) {}

  async transform(value: string): Promise<string> {
    const post: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(value);
    if (!post) {
      throw new NotFoundException(`Post with id: ${value} not found`);
    }
    return value;
  }
}
