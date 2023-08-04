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
import { BloggerBlogsService } from '../application/blogger-blogs.service';
import { CreateBloggerBlogsDto } from '../dto/create-blogger-blogs.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBloggerBlogCommand } from '../application/use-cases/create-blogger-blog.use-case';
import { UpdateBlogByIdCommand } from '../application/use-cases/update-blog-byId.use-case';
import { RemoveBlogByIdCommand } from '../application/use-cases/remove-blog-byId.use-case';
import { RemovePostByPostIdCommand } from '../../posts/application/use-cases/remove-post-byPostId.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { BlogIdParams } from '../../common/query/params/blogId.params';
import { IdParams } from '../../common/query/params/id.params';
import { BlogIdPostIdParams } from '../../common/query/params/blogId-postId.params';
import { FindCommentsCurrentUserCommand } from '../application/use-cases/find-comments-current-user.use-case';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { BanUserForBlogCommand } from '../application/use-cases/ban-user-for-blog.use-case';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { PostsService } from '../../posts/application/posts.service';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { UpdatePostByPostIdCommand } from '../../posts/application/use-cases/update-post.use-case';
import { FindAllBannedUsersForBlogCommand } from '../application/use-cases/find-all-banned-users-for-blog.use.case';

import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('blogger')
export class BloggerBlogsController {
  constructor(
    protected bBloggerService: BloggerBlogsService,
    protected postsService: PostsService,
    protected parseQueriesService: ParseQueriesService,
    protected commandBus: CommandBus,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('blogs')
  async findBlogsCurrentUser(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const currentUserDto: CurrentUserDto = req.user;

    const queryData: ParseQueriesType =
      await this.parseQueriesService.getQueriesData(query);
    return await this.bBloggerService.findBlogsCurrentUser(
      currentUserDto,
      queryData,
    );
  }

  @Get('blogs/comments')
  @UseGuards(JwtAuthGuard)
  async findCommentsCurrentUser(@Request() req: any, @Query() query: any) {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesType =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new FindCommentsCurrentUserCommand(queryData, currentUserDto),
    );
  }

  @Post('blogs')
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Request() req: any,
    @Body() createBBlogsDto: CreateBloggerBlogsDto,
  ) {
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
    @Body() updateBlogDto: CreateBloggerBlogsDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new UpdateBlogByIdCommand(params.id, updateBlogDto, currentUserDto),
    );
  }

  @Get('blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async findPostsByBlogId(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesType =
      await this.parseQueriesService.getQueriesData(query);

    return await this.postsService.findPostsByBlogId(
      params,
      queryData,
      currentUserDto,
    );
  }

  @Post('blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostByBlogId(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Body() createPostDto: CreatePostDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new CreatePostCommand(params.blogId, createPostDto, currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/blog/:id')
  async findBannedUsers(
    @Request() req: any,
    @Param() params: IdParams,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesType =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new FindAllBannedUsersForBlogCommand(
        params.id,
        queryData,
        currentUserDto,
      ),
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
  async banUserForBlog(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateBanUserDto: UpdateBanUserDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new BanUserForBlogCommand(params.id, updateBanUserDto, currentUserDto),
    );
  }

  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async removePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new RemovePostByPostIdCommand(params, currentUserDto),
    );
  }

  @Delete('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async removeBlogById(@Request() req: any, @Param() params: IdParams) {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new RemoveBlogByIdCommand(params.id, currentUserDto),
    );
  }
}
