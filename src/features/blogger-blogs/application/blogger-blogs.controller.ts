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
import { CurrentUserDto } from '../../auth/dto/currentUser.dto';
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
import { OwnerInfoDto } from '../../posts/dto/ownerInfo.dto';
import { UpdatePostPlusIdDto } from '../../posts/dto/update-post-plusId.dto';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post.use-case';
import { BlogIdParams } from '../../common/params/blogId.params';
import { IdParams } from '../../common/params/id.params';
import { BlogIdPostIdParams } from '../../common/params/blogId-postId.params';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private readonly bBloggerService: BloggerBlogsService,
    protected commandBus: CommandBus,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get()
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
  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Request() req: any,
    @Body() createBBlogsDto: CreateBloggerBlogsDto,
  ) {
    const currentUser = req.user;
    const blogsOwnerDto = {
      name: createBBlogsDto.name,
      description: createBBlogsDto.description,
      websiteUrl: createBBlogsDto.websiteUrl,
      blogOwnerInfo: {
        userId: currentUser.id,
        userLogin: currentUser.login,
        isBanned: currentUser.banInfo.isBanned,
      },
    };
    return await this.commandBus.execute(
      new CreateBloggerBlogCommand(blogsOwnerDto),
    );
  }
  @Post(':blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostByBlogId(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Body() createPostBBlogsDto: CreatePostBloggerBlogsDto,
  ) {
    console.log('---------createPostByBlogId----------');
    console.log(params.blogId);
    console.log('-------------------');
    const currentUser: CurrentUserDto = req.user;
    const ownerInfoDto: OwnerInfoDto = {
      userId: currentUser.id,
      userLogin: currentUser.login,
      isBanned: currentUser.banInfo.isBanned,
    };
    const createPostDto = {
      title: createPostBBlogsDto.title,
      shortDescription: createPostBBlogsDto.shortDescription,
      content: createPostBBlogsDto.content,
      blogId: params.blogId,
    };
    return await this.commandBus.execute(
      new CreatePostCommand(createPostDto, ownerInfoDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
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

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeBlogById(@Request() req: any, @Param() params: IdParams) {
    const currentUser: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new RemoveBlogByIdCommand(params.id, currentUser),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':blogId/posts/:postId')
  async updatePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
    @Body() updatePostBBlogDto: UpdatePostBloggerBlogsDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    const ownerInfoDto: OwnerInfoDto = {
      userId: currentUserDto.id,
      userLogin: currentUserDto.login,
      isBanned: currentUserDto.banInfo.isBanned,
    };
    const updatePostPlusIdDto: UpdatePostPlusIdDto = {
      id: params.postId,
      title: updatePostBBlogDto.title,
      shortDescription: updatePostBBlogDto.shortDescription,
      content: updatePostBBlogDto.content,
      blogId: params.blogId,
    };
    return await this.commandBus.execute(
      new UpdatePostCommand(updatePostPlusIdDto, ownerInfoDto),
    );
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':blogId/posts/:postId')
  async removePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
  ) {
    const currentUser: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new RemovePostByPostIdCommand(params.blogId, params.postId, currentUser),
    );
  }
}
