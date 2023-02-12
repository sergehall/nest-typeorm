import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../features/posts/infrastructure/posts.repository';

@ValidatorConstraint({ name: 'PostExists', async: true })
@Injectable()
export class PostExistsRule implements ValidatorConstraintInterface {
  constructor(private postsRepository: PostsRepository) {}

  async validate(value: string) {
    try {
      if (await this.postsRepository.findPostById(value)) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `Post id: ${args.value} doesn't exist`;
  }
}
