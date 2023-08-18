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
import { ChangeLikeStatusPostCommand } from '../application/use-cases/change-likeStatus-post.use-case';
import { PostIdParams } from '../../../common/query/params/postId.params';
import { IdParams } from '../../../common/query/params/id.params';
import { BlogIdPostIdParams } from '../../../common/query/params/blogId-postId.params';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { FindCommentsByPostIdCommand } from '../../comments/application/use-cases/find-comments-by-post-id.use-case';
import { FindPostsCommand } from '../application/use-cases/find-posts.use-case';
import { FindPostByIdCommand } from '../application/use-cases/find-post-by-id.use-case';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { UpdatePostWithBlogIdDto } from '../dto/update-post-with-blog-id.dto';
import { CreatePostWithBlogIdDto } from '../dto/create-post-with-blog-id.dto';
import { UpdatePostByPostIdCommand } from '../application/use-cases/update-post.use-case';
import { PostExistValidationPipe } from '../../../common/pipes/post-exist-validation.pipe';
import { DeletePostByIdCommand } from '../application/use-cases/delete-post-by-id.use-case';
import { ReturnCommentsEntity } from '../../comments/entities/return-comments.entity';
import { ReturnPostsEntity } from '../entities/return-posts.entity';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    protected parseQueriesService: ParseQueriesService,
    protected commandBus: CommandBus,
  ) {}
  @Get()
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindPosts(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginatedResultDto> {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData = await this.parseQueriesService.getQueriesData(query);
    return await this.commandBus.execute(
      new FindPostsCommand(queryData, currentUserDto),
    );
  }

  @Get(':id')
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindPostByPostId(
    @Request() req: any,
    @Param('id', PostExistValidationPipe) id: string,
  ): Promise<ReturnPostsEntity> {
    const currentUserDto: CurrentUserDto | null = req.user;

    return await this.commandBus.execute(
      new FindPostByIdCommand(id, currentUserDto),
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
  ): Promise<PaginatedResultDto> {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new FindCommentsByPostIdCommand(params.postId, queryData, currentUserDto),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async createPost(
    @Request() req: any,
    @Body() createPostWithBlogIdDto: CreatePostWithBlogIdDto,
  ): Promise<ReturnPostsEntity> {
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
  ): Promise<ReturnCommentsEntity> {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new CreateCommentCommand(params.postId, createCommentDto, currentUserDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  @Put(':id')
  async updatePost(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updatePostWithBlogIdDto: UpdatePostWithBlogIdDto,
  ): Promise<boolean> {
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
  async removePost(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new DeletePostByIdCommand(params, currentUserDto),
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
