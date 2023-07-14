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
import { PostsService } from '../application/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { CommentsService } from '../../comments/application/comments.service';
import { ParseQuery } from '../../common/parse-query/parse-query';
import { PaginationDto } from '../../common/pagination/dto/pagination.dto';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { User } from '../../users/infrastructure/schemas/user.schema';
import { LikeStatusDto } from '../dto/like-status.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { UpdatePostDto } from '../dto/update-post.dto';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { RemovePostByIdOldCommand } from '../application/use-cases/remove-post-byId-old.use-case';
import { ChangeLikeStatusPostCommand } from '../application/use-cases/change-likeStatus-post.use-case';
import { PostIdParams } from '../../common/params/postId.params';
import { IdParams } from '../../common/params/id.params';
import { UpdateDataPostDto } from '../dto/update-data-post.dto';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected commentsService: CommentsService,
    protected commandBus: CommandBus,
  ) {}
  @Get()
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async openFindPosts(@Request() req: any, @Query() query: any) {
    const currentUserDto = req.user;
    const queryData = ParseQuery.getPaginationData(query);
    return this.postsService.findPosts(queryData, currentUserDto);
  }

  @Get(':id')
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async openFindPostByPostId(@Request() req: any, @Param() params: IdParams) {
    const currentUserDto: CurrentUserDto | null = req.user;
    return await this.postsService.openFindPostByPostId(
      params.id,
      currentUserDto,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: User })
  async createPost(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new CreatePostCommand(createPostDto, currentUserDto),
    );
  }
  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Request() req: any,
    @Param() params: PostIdParams,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new CreateCommentCommand(params.postId, createCommentDto, currentUserDto),
    );
  }
  @Get(':postId/comments')
  @UseGuards(AbilitiesGuard)
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: User })
  async findCommentsByPostId(
    @Request() req: any,
    @Param() params: PostIdParams,
    @Query() query: any,
  ) {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData = ParseQuery.getPaginationData(query);
    const queryPagination: PaginationDto = queryData.queryPagination;
    return await this.commentsService.findCommentsByPostId(
      queryPagination,
      params.postId,
      currentUserDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Put(':id')
  async updatePost(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const currentUserDto = req.user;
    const updateDataPostDto: UpdateDataPostDto = {
      title: updatePostDto.title,
      shortDescription: updatePostDto.shortDescription,
      content: updatePostDto.content,
    };
    const blogIdPostId = {
      blogId: updatePostDto.blogId,
      postId: params.id,
    };
    const updatePost = await this.commandBus.execute(
      new UpdatePostCommand(updateDataPostDto, blogIdPostId, currentUserDto),
    );
    if (!updatePost) throw new NotFoundException();
    return updatePost;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async removePost(@Request() req: any, @Param() params: IdParams) {
    const currentUser = req.user;
    return await this.commandBus.execute(
      new RemovePostByIdOldCommand(params.id, currentUser),
    );
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  async changeLikeStatusPost(
    @Request() req: any,
    @Param() params: PostIdParams,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new ChangeLikeStatusPostCommand(
        params.postId,
        likeStatusDto,
        currentUserDto,
      ),
    );
  }
}
