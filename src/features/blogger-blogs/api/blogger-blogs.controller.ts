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
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BloggerBlogsService } from '../application/blogger-blogs.service';
import { CreateBloggerBlogsDto } from '../dto/create-blogger-blogs.dto';
import { CreatePostBloggerBlogsDto } from '../dto/create-post-blogger-blogs.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { UpdateDataPostBloggerBlogsDto } from '../dto/update-data-post-blogger-blogs.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBloggerBlogCommand } from '../application/use-cases/create-blogger-blog.use-case';
import { UpdateBlogByIdCommand } from '../application/use-cases/update-blog-byId.use-case';
import { RemoveBlogByIdCommand } from '../application/use-cases/remove-blog-byId.use-case';
import { RemovePostByPostIdCommand } from '../../posts/application/use-cases/remove-post-byPostId.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post.use-case';
import { BlogIdParams } from '../../common/params/blogId.params';
import { IdParams } from '../../common/params/id.params';
import { BlogIdPostIdParams } from '../../common/params/blogId-postId.params';
import { FindCommentsCurrentUserCommand } from '../application/use-cases/find-comments-current-user.use-case';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { BanUserForBlogCommand } from '../application/use-cases/ban-user-for-blog.use-case';
import { CreatePostDto } from '../../posts/dto/create-post.dto';

@SkipThrottle()
@Controller('blogger')
export class BloggerBlogsController {
  constructor(
    private readonly bBloggerService: BloggerBlogsService,
    protected commandBus: CommandBus,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('blogs')
  async findBlogsCurrentUser(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const currentUserDto = req.user;
    const queryData = ParseQuery.getPaginationData(query);
    const searchFilter = { searchNameTerm: queryData.searchNameTerm };
    const userIdFilter = { userId: currentUserDto.id };
    const queryPagination: PaginationDto = queryData.queryPagination;
    return await this.bBloggerService.findBlogsCurrentUser(queryPagination, [
      searchFilter,
      userIdFilter,
    ]);
  }

  @Get('blogs/comments')
  @UseGuards(JwtAuthGuard)
  async findCommentsCurrentUser(@Request() req: any, @Query() query: any) {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData = ParseQuery.getPaginationData(query);
    return await this.commandBus.execute(
      new FindCommentsCurrentUserCommand(queryData, currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/blog/:id')
  async findBannedUsers(
    @Request() req: any,
    @Param() params: IdParams,
    @Query() query: any,
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData = ParseQuery.getPaginationData(query);
    const searchLoginTerm = { searchLoginTerm: queryData.searchLoginTerm };
    const searchByBlogId = { blogId: params.id };
    const banStatus = { banStatus: 'true' };
    const queryPagination: PaginationDto = queryData.queryPagination;
    return await this.bBloggerService.findBannedUsers(
      params.id,
      queryPagination,
      [searchLoginTerm, searchByBlogId, banStatus],
      currentUserDto,
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
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new UpdateBlogByIdCommand(params.id, updateBlogDto, currentUserDto),
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

  @Post('blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostByBlogId(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Body() createPostBBlogsDto: CreatePostBloggerBlogsDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    const createPostDto: CreatePostDto = {
      title: createPostBBlogsDto.title,
      shortDescription: createPostBBlogsDto.shortDescription,
      content: createPostBBlogsDto.content,
      blogId: params.blogId,
    };
    return await this.commandBus.execute(
      new CreatePostCommand(createPostDto, currentUserDto),
    );
  }

  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updatePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
    @Body() updatePostBBlogDto: UpdateDataPostBloggerBlogsDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new UpdatePostCommand(updatePostBBlogDto, params, currentUserDto),
    );
  }

  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async removePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
  ) {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new RemovePostByPostIdCommand(
        params.blogId,
        params.postId,
        currentUserDto,
      ),
    );
  }

  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async banUserForBlog(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateBanUserDto: UpdateBanUserDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new BanUserForBlogCommand(params.id, updateBanUserDto, currentUserDto),
    );
  }
}
