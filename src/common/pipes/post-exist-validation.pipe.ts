import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { PostsRawSqlRepository } from '../../features/posts/infrastructure/posts-raw-sql.repository';
import { TablesPostsEntity } from '../../features/posts/entities/tables-posts-entity';

@Injectable()
export class PostExistValidationPipe implements PipeTransform {
  constructor(private postsRawSqlRepository: PostsRawSqlRepository) {}

  async transform(value: string): Promise<string> {
    const post: TablesPostsEntity | null =
      await this.postsRawSqlRepository.getPostById(value);
    if (!post) {
      throw new NotFoundException(`Post with id: ${value} not found`);
    }
    return value;
  }
}
