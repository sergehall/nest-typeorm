import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { BlogExistValidationPipe } from '../../../common/pipes/blog-exist-validation.pipe';
import { PaginatorDto } from '../../../common/helpers/paginator.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { CommandBus } from '@nestjs/cqrs';
import { SearchBlogsCommand } from '../application/use-cases/search-blogs.use-case';
import { GetBlogByIdCommand } from '../application/use-cases/get-blog-by-id.use-case';
import { IdParams } from '../../../common/query/params/id.params';
import { GetPostsInBlogCommand } from '../../posts/application/use-cases/get-posts-in-blog.use-case';
import { BloggerBlogsWithImagesViewModel } from '../../blogger-blogs/views/blogger-blogs-with-images.view-model';
import { BlogIdParams } from '../../../common/query/params/blogId.params';
import { ManageBlogsSubscribeCommand } from '../../blogger-blogs/application/use-cases/manage-blogs-subscribe.use-case';
import { SubscriptionStatus } from '../../blogger-blogs/enums/subscription-status.enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@SkipThrottle()
@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    protected commandBus: CommandBus,
    protected parseQueriesService: ParseQueriesService,
  ) {}

  @Get()
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async searchBlogs(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginatorDto> {
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    const currentUserDto: CurrentUserDto | null = req.user;

    return await this.commandBus.execute(
      new SearchBlogsCommand(queryData, currentUserDto),
    );
  }

  @Get(':id')
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openGetBlogById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<BloggerBlogsWithImagesViewModel> {
    const currentUserDto: CurrentUserDto | null = req.user;

    return await this.commandBus.execute(
      new GetBlogByIdCommand(params.id, currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':blogId/subscription')
  @UseGuards(JwtAuthGuard)
  async subscribeToBlog(
    @Request() req: any,
    @Param() params: BlogIdParams,
  ): Promise<BloggerBlogsWithImagesViewModel> {
    const currentUserDto: CurrentUserDto = req.user;
    const subscriptionStatus: SubscriptionStatus =
      SubscriptionStatus.Subscribed;

    return await this.commandBus.execute(
      new ManageBlogsSubscribeCommand(
        params,
        subscriptionStatus,
        currentUserDto,
      ),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId/subscription')
  @UseGuards(JwtAuthGuard)
  async unsubscribeToBlog(
    @Request() req: any,
    @Param() params: BlogIdParams,
  ): Promise<BloggerBlogsWithImagesViewModel> {
    const currentUserDto: CurrentUserDto = req.user;

    const subscriptionStatus: SubscriptionStatus =
      SubscriptionStatus.Unsubscribed;

    return await this.commandBus.execute(
      new ManageBlogsSubscribeCommand(
        params,
        subscriptionStatus,
        currentUserDto,
      ),
    );
  }

  @Get(':blogId/posts')
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openSearchPostsInBlog(
    @Request() req: any,
    @Param('blogId', BlogExistValidationPipe) blogId: string,
    @Query() query: any,
  ): Promise<PaginatorDto> {
    const currentUserDto: CurrentUserDto | null = req.user;

    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetPostsInBlogCommand(blogId, queryData, currentUserDto),
    );
  }
}
