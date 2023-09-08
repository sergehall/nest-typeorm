import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BloggerBlogsRepo } from '../../features/blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../features/blogger-blogs/entities/blogger-blogs.entity';

@ValidatorConstraint({ name: 'BlogExistsValidator', async: true })
@Injectable()
export class BlogExistsValidator implements ValidatorConstraintInterface {
  constructor(private bloggerBlogsRepo: BloggerBlogsRepo) {}

  async validate(value: string): Promise<boolean> {
    try {
      const blog: BloggerBlogsEntity | null =
        await this.bloggerBlogsRepo.findBlogById(value);
      return !!blog; // Convert the blog to a boolean value (true if not null, false if null)
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog id:${args.value} doesn't exist`;
  }
}
