import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BBlogsRepository } from '../bblogger/infrastructure/bblogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private bBlogsRepository: BBlogsRepository) {}

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
