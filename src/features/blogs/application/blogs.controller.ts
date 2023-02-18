import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { SkipThrottle } from '@nestjs/throttler';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { IdParams } from '../../common/params/id.params';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(protected blogsService: BlogsService) {}

  @Get()
  async openFindBlogs(@Query() query: any): Promise<PaginationTypes> {
    const queryData = ParseQuery.getPaginationData(query);
    const searchFilter = { searchNameTerm: queryData.searchNameTerm };
    const queryPagination: PaginationDto = queryData.queryPagination;
    const blogs = await this.blogsService.openFindBlogs(queryPagination, [
      searchFilter,
    ]);
    if (!blogs) {
      throw new NotFoundException();
    }
    return blogs;
  }

  @Get(':id')
  async openFindBlogById(
    @Param() params: IdParams,
  ): Promise<BloggerBlogsEntity | null> {
    const blog = await this.blogsService.openFindBlogById(params.id);
    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }
}
