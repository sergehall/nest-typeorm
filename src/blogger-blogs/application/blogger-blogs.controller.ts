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
import { PaginationTypes } from '../../infrastructure/common/pagination/types/pagination.types';
import { ParseQuery } from '../../infrastructure/common/parse-query/parse-query';
import { PaginationDto } from '../../infrastructure/common/pagination/dto/pagination.dto';
import { UpdatePostBloggerBlogsDto } from '../dto/update-post-blogger-blogs.dto';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(private readonly bBloggerService: BloggerBlogsService) {}
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
    return await this.bBloggerService.createBlog(blogsOwnerDto);
  }
  @Post(':blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostByBlogId(
    @Request() req: any,
    @Param('blogId') blogId: string,
    @Body() createPostBBlogsDto: CreatePostBloggerBlogsDto,
  ) {
    const currentUser: CurrentUserDto = req.user;
    const createPostDto = {
      title: createPostBBlogsDto.title,
      shortDescription: createPostBBlogsDto.shortDescription,
      content: createPostBBlogsDto.content,
      blogId: blogId,
    };
    return await this.bBloggerService.createPost(createPostDto, currentUser);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateBlogById(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateBlogDto: CreateBloggerBlogsDto,
  ) {
    const currentUser: CurrentUserDto = req.user;
    return this.bBloggerService.updateBlogById(id, updateBlogDto, currentUser);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeBlogById(@Request() req: any, @Param('id') id: string) {
    const currentUser: CurrentUserDto = req.user;
    return await this.bBloggerService.removeBlogById(id, currentUser);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':blogId/posts/:postId')
  async updatePostByPostId(
    @Request() req: any,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() updatePostBBlogDto: UpdatePostBloggerBlogsDto,
  ) {
    const currentUser: CurrentUserDto = req.user;
    return await this.bBloggerService.updatePostByPostId(
      blogId,
      postId,
      updatePostBBlogDto,
      currentUser,
    );
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':blogId/posts/:postId')
  async removePostByPostId(
    @Request() req: any,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    const currentUser: CurrentUserDto = req.user;
    //
    return await this.bBloggerService.removePostByPostId(
      blogId,
      postId,
      currentUser,
    );
  }
}
