import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { ReturnBloggerBlogsEntity } from '../../blogger-blogs/entities/return-blogger-blogs.entity';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogExistValidationPipe } from '../../../common/pipes/blog-exist-validation.pipe';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { SearchPostsInBlogCommand } from '../../posts/application/use-cases/search-posts-in-blog.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { SearchBlogsCommand } from '../application/use-cases/search-blogs.use-case';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    protected commandBus: CommandBus,
    protected blogsService: BlogsService,
    protected parseQueriesService: ParseQueriesService,
  ) {}

  @Get()
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async searchBlogs(@Query() query: any): Promise<PaginatedResultDto> {
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(new SearchBlogsCommand(queryData));
  }

  @Get(':id')
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindBlogById(
    @Param('id', BlogExistValidationPipe) blogId: string,
  ): Promise<ReturnBloggerBlogsEntity> {
    return await this.blogsService.openFindBlogById(blogId);
  }

  @Get(':blogId/posts')
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindPostsByBlogId(
    @Request() req: any,
    @Param('blogId', BlogExistValidationPipe) blogId: string,
    @Query() query: any,
  ): Promise<PaginatedResultDto> {
    const params = { blogId: blogId };
    const currentUserDto: CurrentUserDto | null = req.user;

    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new SearchPostsInBlogCommand(params, queryData, currentUserDto),
    );
  }
}
