import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogger/infrastructure/blogs.repository';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsRule implements ValidatorConstraintInterface {
  constructor(private bBlogsRepository: BlogsRepository) {}

  async validate(value: string) {
    try {
      if (await this.bBlogsRepository.findBlogById(value)) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog id: ${args.value} doesn't exist`;
  }
}
