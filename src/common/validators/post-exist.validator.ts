import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PostsRepo } from '../../features/posts/infrastructure/posts-repo';
import { PostsEntity } from '../../features/posts/entities/posts.entity';

@ValidatorConstraint({ name: 'PostExistValidator', async: true })
@Injectable()
export class PostExistValidator implements ValidatorConstraintInterface {
  constructor(private postsRepo: PostsRepo) {}

  async validate(value: string): Promise<boolean> {
    try {
      console.log(value, 'value');
      console.log(value, 'value2');
      const post: PostsEntity | null =
        await this.postsRepo.getPostByIdWithoutLikes(value);
      console.log(post, 'post');
      return !!post; // Convert the blog to a boolean value (true if not null, false if null)
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Post id:${args.value} doesn't exist`;
  }
}
