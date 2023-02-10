import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpCode,
  UseGuards,
  HttpStatus,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { CommentsService } from '../../comments/application/comments.service';
import { ParseQuery } from '../../infrastructure/common/parse-query/parse-query';
import { PaginationDto } from '../../infrastructure/common/pagination/dto/pagination.dto';
import { UsersEntity } from '../../users/entities/users.entity';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { AbilitiesGuard } from '../../ability/abilities.guard';
import { CheckAbilities } from '../../ability/abilities.decorator';
import { Action } from '../../ability/roles/action.enum';
import { User } from '../../users/infrastructure/schemas/user.schema';
import { LikeStatusDto } from '../dto/like-status.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { BloggerBlogsService } from '../../blogger-blogs/application/blogger-blogs.service';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsWithoutOwnersInfoEntity } from '../entities/posts-without-ownerInfo.entity';
import { OwnerInfoDto } from '../dto/ownerInfo.dto';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { ChangeLikeStatusCommentCommand } from '../../comments/application/use-cases/change-likeStatus-comment.use-case';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly bloggerBlogsService: BloggerBlogsService,
    protected commandBus: CommandBus,
  ) {}
  @Get()
  @UseGuards(AbilitiesGuard)
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async findPosts(@Request() req: any, @Query() query: any) {
    const currentUser = req.user;
    const paginationData = ParseQuery.getPaginationData(query);
    const searchFilters = {};
    const queryPagination: PaginationDto = {
      pageNumber: paginationData.pageNumber,
      pageSize: paginationData.pageSize,
      sortBy: paginationData.sortBy,
      sortDirection: paginationData.sortDirection,
    };
    return this.postsService.findPosts(
      queryPagination,
      [searchFilters],
      currentUser,
    );
  }
  @Get(':postId')
  @UseGuards(AbilitiesGuard)
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async findPostById(
    @Request() req: any,
    @Param('postId') postId: string,
  ): Promise<PostsWithoutOwnersInfoEntity> {
    const currentUser: UsersEntity | null = req.user;
    const post = await this.postsService.findPostById(postId, currentUser);
    if (!post) throw new NotFoundException();
    return post;
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: User })
  async createPost(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    const currentUser = req.user;
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsService.findBlogById(createPostDto.blogId);
    if (!blog) throw new NotFoundException();
    const createPost = {
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: createPostDto.blogId,
      name: blog.name,
    };
    const ownerInfoDto: OwnerInfoDto = {
      userId: currentUser.id,
      userLogin: currentUser.login,
      isBanned: currentUser.banInfo.isBanned,
    };
    return this.postsService.createPost(createPost, ownerInfoDto);
  }
  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const currentUser: UsersEntity = req.user;
    return await this.commandBus.execute(
      new CreateCommentCommand(postId, createCommentDto, currentUser),
    );
  }
  @Get(':postId/comments')
  @UseGuards(AbilitiesGuard)
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async findComments(
    @Request() req: any,
    @Param('postId') postId: string,
    @Query() query: any,
  ) {
    const currentUser: UsersEntity | null = req.user;
    const paginationData = ParseQuery.getPaginationData(query);
    const queryPagination: PaginationDto = {
      pageNumber: paginationData.pageNumber,
      pageSize: paginationData.pageSize,
      sortBy: paginationData.sortBy,
      sortDirection: paginationData.sortDirection,
    };
    const post = await this.postsService.checkPostInDB(postId);
    if (!post) throw new NotFoundException();
    return await this.commentsService.findCommentsByPostId(
      queryPagination,
      postId,
      currentUser,
    );
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: CreatePostDto,
  ) {
    const post = await this.postsService.updatePost(id, updatePostDto);
    if (!post) throw new NotFoundException();
    return post;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async removePost(@Param('id') id: string) {
    return await this.postsService.removePost(id);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  async changeLikeStatusPost(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    const currentUser = req.user;
    return await this.commandBus.execute(
      new ChangeLikeStatusCommentCommand(postId, likeStatusDto, currentUser),
    );
  }
}
