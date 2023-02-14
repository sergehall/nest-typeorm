import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { QueryArrType } from '../../common/convert-filters/types/convert-filter.types';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';

@Injectable()
export class BlogsService {
  constructor(protected bloggerBlogsService: BloggerBlogsService) {}
  async findBlogsById(id: string): Promise<BloggerBlogsEntity | null> {
    return await this.bloggerBlogsService.findBlogByIdForBlogs(id);
  }
  async findBlogs(
    queryPagination: PaginationDto,
    searchFilters: QueryArrType,
  ): Promise<PaginationTypes> {
    return await this.bloggerBlogsService.findBlogs(
      queryPagination,
      searchFilters,
    );
  }
}
