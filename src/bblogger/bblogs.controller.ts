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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BBlogsService } from './bblogs.service';
import { CreateBBlogsDto } from './dto/create-bblogs.dto';
import { CreatePostBBlogsDto } from './dto/create-post-bblogs.dto';
import { CurrentUserDto } from '../auth/dto/currentUser.dto';
import { PaginationTypes } from '../infrastructure/common/pagination/types/pagination.types';
import { ParseQuery } from '../infrastructure/common/parse-query/parse-query';
import { PaginationDto } from '../infrastructure/common/pagination/dto/pagination.dto';
import { UpdatePostBBlogDto } from './dto/update-post-bblog.dto';

@SkipThrottle()
@Controller('blogger/blogs')
export class BBlogsController {
  constructor(private readonly bBloggerService: BBlogsService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  async findBlogsByUserId(
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
    return await this.bBloggerService.findBlogsByUserId(queryPagination, [
      searchFilter,
      userIdFilter,
    ]);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlogger(
    @Request() req: any,
    @Body() createBBlogsDto: CreateBBlogsDto,
  ) {
    const currentUser = req.user;
    const bBlogsOwnerDto = {
      name: createBBlogsDto.name,
      description: createBBlogsDto.description,
      websiteUrl: createBBlogsDto.websiteUrl,
      blogOwnerInfo: {
        userId: currentUser.id,
        userLogin: currentUser.login,
      },
    };
    return await this.bBloggerService.createBlog(bBlogsOwnerDto);
  }
  @Post(':blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostByBlogId(
    @Request() req: any,
    @Param('blogId') blogId: string,
    @Body() createPostBBlogsDto: CreatePostBBlogsDto,
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
    @Body() updateBlogDto: CreateBBlogsDto,
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
    @Body() updatePostBBlogDto: UpdatePostBBlogDto,
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
