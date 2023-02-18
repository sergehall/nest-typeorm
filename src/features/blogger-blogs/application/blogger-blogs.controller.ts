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
import { BloggerBlogsService } from './blogger-blogs.service';
import { CreateBloggerBlogsDto } from '../dto/create-blogger-blogs.dto';
import { CreatePostBloggerBlogsDto } from '../dto/create-post-blogger-blogs.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { UpdatePostBloggerBlogsDto } from '../dto/update-post-blogger-blogs.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBloggerBlogCommand } from './use-cases/create-blogger-blog.use-case';
import { UpdateBlogByIdCommand } from './use-cases/update-blog-byId.use-case';
import { RemoveBlogByIdCommand } from './use-cases/remove-blog-byId.use-case';
import { RemovePostByPostIdCommand } from '../../posts/application/use-cases/remove-post-byPostId.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { UpdatePostPlusIdDto } from '../../posts/dto/update-post-plusId.dto';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post.use-case';
import { BlogIdParams } from '../../common/params/blogId.params';
import { IdParams } from '../../common/params/id.params';
import { BlogIdPostIdParams } from '../../common/params/blogId-postId.params';
import { FindCommentsCurrentUserCommand } from './use-cases/find-comments-current-user.use-case';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { BanUserForBlogCommand } from './use-cases/ban-user-for-blog.use-case';

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
    const currentUser = req.user;
    const paginationData = ParseQuery.getPaginationData(query);
    const searchFilter = { searchNameTerm: paginationData.searchNameTerm };
    const userIdFilter = { userId: currentUser.id };
    const queryPagination: PaginationDto = {
      pageNumber: paginationData.pageNumber,
      pageSize: paginationData.pageSize,
      sortBy: paginationData.sortBy,
      sortDirection: paginationData.sortDirection,
    };
    return await this.bBloggerService.findBlogsCurrentUser(queryPagination, [
      searchFilter,
      userIdFilter,
    ]);
  }

  @Get('blogs/comments')
  @UseGuards(JwtAuthGuard)
  async findCommentsCurrentUser(@Request() req: any, @Query() query: any) {
    const currentUser: CurrentUserDto = req.user;
    const paginationData = ParseQuery.getPaginationData(query);
    const queryPagination: PaginationDto = {
      pageNumber: paginationData.pageNumber,
      pageSize: paginationData.pageSize,
      sortBy: paginationData.sortBy,
      sortDirection: paginationData.sortDirection,
    };
    return await this.commandBus.execute(
      new FindCommentsCurrentUserCommand(queryPagination, currentUser),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/blog/:id')
  async findBannedUsers(
    @Request() req: any,
    @Param() params: IdParams,
    @Query() query: any,
  ) {
    const currentUser: CurrentUserDto = req.user;
    const blogId = params.id;
    const queryData = ParseQuery.getPaginationData(query);
    const searchLoginTerm = { searchLoginTerm: queryData.searchLoginTerm };
    const searchByBlogId = { blogId: blogId };
    const banStatus = { banStatus: 'true' };
    const queryPagination: PaginationDto = {
      pageNumber: queryData.pageNumber,
      pageSize: queryData.pageSize,
      sortBy: queryData.sortBy,
      sortDirection: queryData.sortDirection,
    };
    return await this.bBloggerService.findBannedUsers(
      blogId,
      currentUser,
      queryPagination,
      [searchLoginTerm, searchByBlogId, banStatus],
    );
  }

  @Post('blogs')
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Request() req: any,
    @Body() createBBlogsDto: CreateBloggerBlogsDto,
  ) {
    const currentUser = req.user;
    return await this.commandBus.execute(
      new CreateBloggerBlogCommand(createBBlogsDto, currentUser),
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
    const currentUser: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new UpdateBlogByIdCommand(params.id, updateBlogDto, currentUser),
    );
  }

  @Delete('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async removeBlogById(@Request() req: any, @Param() params: IdParams) {
    const currentUser: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new RemoveBlogByIdCommand(params.id, currentUser),
    );
  }

  @Post('blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostByBlogId(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Body() createPostBBlogsDto: CreatePostBloggerBlogsDto,
  ) {
    const currentUser: CurrentUserDto = req.user;
    const createPostDto = {
      title: createPostBBlogsDto.title,
      shortDescription: createPostBBlogsDto.shortDescription,
      content: createPostBBlogsDto.content,
      blogId: params.blogId,
    };
    return await this.commandBus.execute(
      new CreatePostCommand(createPostDto, currentUser),
    );
  }

  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updatePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
    @Body() updatePostBBlogDto: UpdatePostBloggerBlogsDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    const updatePostPlusIdDto: UpdatePostPlusIdDto = {
      id: params.postId,
      title: updatePostBBlogDto.title,
      shortDescription: updatePostBBlogDto.shortDescription,
      content: updatePostBBlogDto.content,
      blogId: params.blogId,
    };
    return await this.commandBus.execute(
      new UpdatePostCommand(updatePostPlusIdDto, currentUserDto),
    );
  }

  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async removePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
  ) {
    const currentUser = req.user;
    return await this.commandBus.execute(
      new RemovePostByPostIdCommand(params.blogId, params.postId, currentUser),
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
    const currentUser: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new BanUserForBlogCommand(params.id, updateBanUserDto, currentUser),
    );
  }
}
