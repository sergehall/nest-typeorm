import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BloggerBlogsRawSqlRepository } from '../features/blogger-blogs/infrastructure/blogger-blogs-raw-sql.repository';
import { TableBloggerBlogsRawSqlEntity } from '../features/blogger-blogs/entities/table-blogger-blogs-raw-sql.entity';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(
    private bloggerBlogsRawSqlRepository: BloggerBlogsRawSqlRepository,
  ) {}

  async validate(value: string): Promise<boolean> {
    try {
      const blog: TableBloggerBlogsRawSqlEntity | null =
        await this.bloggerBlogsRawSqlRepository.openFindBlogById(value);
      return !!blog; // Convert the blog to a boolean value (true if not null, false if null)
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog id: ${args.value} doesn't exist`;
  }
}
