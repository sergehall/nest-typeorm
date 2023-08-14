import { Injectable } from '@nestjs/common';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { ReturnBloggerBlogsEntity } from '../../blogger-blogs/entities/return-blogger-blogs.entity';
import { PostsService } from '../../posts/application/posts.service';
import { BlogIdParams } from '../../../common/query/params/blogId.params';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';

@Injectable()
export class BlogsService {
  constructor(
    protected bloggerBlogsService: BloggerBlogsService,
    protected postsService: PostsService,
  ) {}
  async openFindBlogById(blogId: string): Promise<ReturnBloggerBlogsEntity> {
    return await this.bloggerBlogsService.openFindBlogById(blogId);
  }

  async openFindBlogs(queryData: ParseQueriesDto): Promise<PaginatedResultDto> {
    return await this.bloggerBlogsService.openFindBlogs(queryData);
  }

  async openFindPostsByBlogId(
    params: BlogIdParams,
    queryData: ParseQueriesDto,
    currentUserDto: CurrentUserDto | null,
  ): Promise<PaginatedResultDto> {
    return await this.postsService.openFindPostsByBlogId(
      params,
      queryData,
      currentUserDto,
    );
  }
}
