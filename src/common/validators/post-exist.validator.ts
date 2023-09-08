import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepo } from '../../features/posts/infrastructure/posts-repo';
import { PostsEntity } from '../../features/posts/entities/posts.entity';

@ValidatorConstraint({ name: 'PostExistValidator', async: true })
@Injectable()
export class PostExistValidator implements ValidatorConstraintInterface {
  constructor(private postsRepo: PostsRepo) {}

  async validate(value: string): Promise<boolean> {
    try {
      const post: PostsEntity | null =
        await this.postsRepo.getPostByIdWithoutLikes(value);
      return !!post; // Convert the blog to a boolean value (true if not null, false if null)
    } catch (error) {
      throw new NotFoundException(`Post with ID ${value} not found`);
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Post id:${args.value} doesn't exist`;
  }
}
