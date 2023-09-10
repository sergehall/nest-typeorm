import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBloggerBlogCommand } from '../application/use-cases/create-blogger-blog.use-case';
import { UpdateBlogByIdCommand } from '../application/use-cases/update-blog-byId.use-case';
import { DeleteBlogByBlogIdCommand } from '../application/use-cases/delete-blog-by-blog-id.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { BlogIdParams } from '../../../common/query/params/blogId.params';
import { IdParams } from '../../../common/query/params/id.params';
import { BlogIdPostIdParams } from '../../../common/query/params/blogId-postId.params';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { UpdatePostByPostIdCommand } from '../../posts/application/use-cases/update-post.use-case';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ReturnPostsEntity } from '../../posts/entities/return-posts.entity';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { SearchBannedUsersInBlogCommand } from '../application/use-cases/search-banned-users-in-blog.use.case';
import { ManageBlogAccessCommand } from '../application/use-cases/manage-blog-access.use-case';
import { GetBlogsOwnedByCurrentUserCommand } from '../application/use-cases/get-blogs-owned-by-current-user.use-case';
import { GetCommentsOwnedByCurrentUserCommand } from '../application/use-cases/get-comments-owned-by-current-user.use-case';
import { BlogExistValidationPipe } from '../../../common/pipes/blog-exist-validation.pipe';
import { DeletePostByPostIdAndBlogIdCommand } from '../../posts/application/use-cases/delete-post-by-post-id-and-blog-id.use-case';
import { ReturnBloggerBlogsDto } from '../entities/return-blogger-blogs.entity';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { GetPostsInBlogCommand } from '../../posts/application/use-cases/get-posts-in-blog.use-case';

@SkipThrottle()
@Controller('blogger')
export class BloggerBlogsController {
  constructor(
    protected parseQueriesService: ParseQueriesService,
    protected commandBus: CommandBus,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('blogs')
  async getBlogsOwnedByCurrentUser(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginatedResultDto> {
    const currentUserDto: CurrentUserDto = req.user;

    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetBlogsOwnedByCurrentUserCommand(queryData, currentUserDto),
    );
  }

  @Get('blogs/comments')
  @UseGuards(JwtAuthGuard)
  async getCommentsOwnedByCurrentUser(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginatedResultDto> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetCommentsOwnedByCurrentUserCommand(queryData, currentUserDto),
    );
  }

  @Post('blogs')
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Request() req: any,
    @Body() createBBlogsDto: CreateBlogsDto,
  ): Promise<ReturnBloggerBlogsDto> {
    const currentUserDto = req.user;

    return await this.commandBus.execute(
      new CreateBloggerBlogCommand(createBBlogsDto, currentUserDto),
    );
  }

  @Put('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateBlogById(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateBlogDto: CreateBlogsDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new UpdateBlogByIdCommand(params.id, updateBlogDto, currentUserDto),
    );
  }

  @Get('blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async getPostsInBlog(
    @Request() req: any,
    @Param('blogId', BlogExistValidationPipe) blogId: string,
    @Query() query: any,
  ): Promise<PaginatedResultDto> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetPostsInBlogCommand(blogId, queryData, currentUserDto),
    );
  }

  @Post('blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostInBlog(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Body() createPostDto: CreatePostDto,
  ): Promise<ReturnPostsEntity> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new CreatePostCommand(params.blogId, createPostDto, currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/blog/:id')
  async searchBannedUsersInBlog(
    @Request() req: any,
    @Param() params: IdParams,
    @Query() query: any,
  ): Promise<PaginatedResultDto> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new SearchBannedUsersInBlogCommand(params.id, queryData, currentUserDto),
    );
  }

  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updatePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new UpdatePostByPostIdCommand(params, updatePostDto, currentUserDto),
    );
  }

  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async manageBlogAccess(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateBanUserDto: UpdateBanUserDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new ManageBlogAccessCommand(params.id, updateBanUserDto, currentUserDto),
    );
  }

  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deletePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new DeletePostByPostIdAndBlogIdCommand(params, currentUserDto),
    );
  }

  @Delete('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteBlogById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new DeleteBlogByBlogIdCommand(params.id, currentUserDto),
    );
  }
}
