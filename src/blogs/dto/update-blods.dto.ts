import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogsDto } from './create-blogs.dto';

export class UpdateBlogDto extends PartialType(CreateBlogsDto) {}
