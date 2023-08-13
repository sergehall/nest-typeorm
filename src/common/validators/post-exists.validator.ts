import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PostsRawSqlRepository } from '../../features/posts/infrastructure/posts-raw-sql.repository';

@ValidatorConstraint({ name: 'PostExists', async: true })
@Injectable()
export class PostExistsValidator implements ValidatorConstraintInterface {
  constructor(private postsRawSqlRepository: PostsRawSqlRepository) {}

  async validate(value: string): Promise<boolean> {
    try {
      const post = await this.postsRawSqlRepository.getPostById(value);
      return !!post; // Returns true if the post exists, false otherwise.
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Post id:${args.value} doesn't exist`;
  }
}
