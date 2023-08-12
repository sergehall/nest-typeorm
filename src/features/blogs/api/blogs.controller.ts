import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { PaginationTypes } from '../../../common/pagination/types/pagination.types';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { ReturnBloggerBlogsEntity } from '../../blogger-blogs/entities/return-blogger-blogs.entity';
import { ParseQueriesType } from '../../../common/query/types/parse-query.types';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogExistNotFoundRule } from '../../../common/pipes/blog-exist-not-found-rule.pipe';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected parseQueriesService: ParseQueriesService,
  ) {}

  @Get()
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindBlogs(@Query() query: any): Promise<PaginationTypes> {
    const queryData: ParseQueriesType =
      await this.parseQueriesService.getQueriesData(query);

    return await this.blogsService.openFindBlogs(queryData);
  }

  @Get(':id')
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindBlogById(
    @Param('id', BlogExistNotFoundRule) blogId: string,
  ): Promise<ReturnBloggerBlogsEntity> {
    return await this.blogsService.openFindBlogById(blogId);
  }

  @Get(':blogId/posts')
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindPostsByBlogId(
    @Request() req: any,
    @Param('blogId', BlogExistNotFoundRule) blogId: string,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const params = { blogId: blogId };
    const currentUserDto: CurrentUserDto | null = req.user;

    const queryData: ParseQueriesType =
      await this.parseQueriesService.getQueriesData(query);

    return await this.blogsService.openFindPostsByBlogId(
      params,
      queryData,
      currentUserDto,
    );
  }
}
