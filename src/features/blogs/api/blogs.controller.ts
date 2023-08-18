import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogExistValidationPipe } from '../../../common/pipes/blog-exist-validation.pipe';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { CommandBus } from '@nestjs/cqrs';
import { SearchBlogsCommand } from '../application/use-cases/search-blogs.use-case';
import { GetBlogByIdCommand } from '../application/use-cases/get-blog-by-id.use-case';
import { SearchPostsInBlogCommand } from '../../posts/application/use-cases/search-posts-in-blog.use-case';
import { IdParams } from '../../../common/query/params/id.params';
import { ReturnBloggerBlogsEntity } from '../../blogger-blogs/entities/return-blogger-blogs.entity';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    protected commandBus: CommandBus,
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
  async openGetBlogById(
    @Param() params: IdParams,
  ): Promise<ReturnBloggerBlogsEntity> {
    return await this.commandBus.execute(new GetBlogByIdCommand(params.id));
  }

  @Get(':blogId/posts')
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openSearchPostsInBlog(
    @Request() req: any,
    @Param('blogId', BlogExistValidationPipe) blogId: string,
    @Query() query: any,
  ): Promise<PaginatedResultDto> {
    const currentUserDto: CurrentUserDto | null = req.user;

    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new SearchPostsInBlogCommand(blogId, queryData, currentUserDto),
    );
  }
}
