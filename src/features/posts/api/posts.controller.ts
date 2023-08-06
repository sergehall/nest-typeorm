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
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { LikeStatusDto } from '../dto/like-status.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { RemovePostByIdOldCommand } from '../application/use-cases/remove-post-byId-old.use-case';
import { ChangeLikeStatusPostCommand } from '../application/use-cases/change-likeStatus-post.use-case';
import { PostIdParams } from '../../common/query/params/postId.params';
import { IdParams } from '../../common/query/params/id.params';
import { UpdatePostByPostIdCommand } from '../application/use-cases/update-post.use-case';
import { UpdatePostWithBlogIdDto } from '../dto/update-post-withBlogId.dto';
import { CreatePostWithBlogIdDto } from '../dto/create-post-withBlogId.dto';
import { BlogIdPostIdParams } from '../../common/query/params/blogId-postId.params';
import { PaginationTypes } from '../../common/pagination/types/pagination.types';
import { ParseQueriesService } from '../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ParseQueriesType } from '../../common/query/types/parse-query.types';
import { FindCommentsByPostIdCommand } from '../../comments/application/use-cases/find-comments-by-post-id.use-case';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    protected parseQueriesService: ParseQueriesService,
    protected postsService: PostsService,
    protected commandBus: CommandBus,
  ) {}
  @Get()
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindPosts(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData = await this.parseQueriesService.getQueriesData(query);

    return this.postsService.openFindPosts(queryData, currentUserDto);
  }

  @Get(':id')
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
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
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async createPost(
    @Request() req: any,
    @Body() createPostWithBlogIdDto: CreatePostWithBlogIdDto,
  ) {
    const currentUserDto: CurrentUserDto = req.user;
    const { blogId, ...createPostDto } = createPostWithBlogIdDto;

    return await this.commandBus.execute(
      new CreatePostCommand(blogId, createPostDto, currentUserDto),
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
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async findCommentsByPostId(
    @Request() req: any,
    @Param() params: PostIdParams,
    @Query() query: any,
  ): Promise<PaginationTypes> {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData: ParseQueriesType =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new FindCommentsByPostIdCommand(params.postId, queryData, currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Put(':id')
  async updatePost(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updatePostWithBlogIdDto: UpdatePostWithBlogIdDto,
  ) {
    const currentUserDto = req.user;
    const { blogId, ...updatePostDto } = updatePostWithBlogIdDto;
    const idBlogId: BlogIdPostIdParams = {
      postId: params.id,
      blogId: blogId,
    };

    return await this.commandBus.execute(
      new UpdatePostByPostIdCommand(idBlogId, updatePostDto, currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async removePost(@Request() req: any, @Param() params: IdParams) {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new RemovePostByIdOldCommand(params.id, currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  async changeLikeStatusPost(
    @Request() req: any,
    @Param() params: PostIdParams,
    @Body() likeStatusDto: LikeStatusDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new ChangeLikeStatusPostCommand(
        params.postId,
        likeStatusDto,
        currentUserDto,
      ),
    );
  }
}
