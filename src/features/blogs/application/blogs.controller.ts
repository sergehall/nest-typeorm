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
  async findBlogs(@Query() query: any): Promise<PaginationTypes> {
    const paginationData = ParseQuery.getPaginationData(query);
    const searchFilter = { searchNameTerm: paginationData.searchNameTerm };
    const banStatus = { banStatus: 'false' };
    const queryPagination: PaginationDto = {
      pageNumber: paginationData.pageNumber,
      pageSize: paginationData.pageSize,
      sortBy: paginationData.sortBy,
      sortDirection: paginationData.sortDirection,
    };
    console.log(searchFilter, queryPagination);
    const blogs = await this.blogsService.findBlogs(queryPagination, [
      searchFilter,
      banStatus,
    ]);
    if (!blogs) {
      throw new NotFoundException();
    }
    return blogs;
  }

  @Get(':id')
  async findBlogsById(
    @Param() params: IdParams,
  ): Promise<BloggerBlogsEntity | null> {
    const blog = await this.blogsService.findBlogsById(params.id);
    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }
}
