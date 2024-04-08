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
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { Action } from '../../../ability/roles/action.enum';
import { LikeStatusDto } from '../dto/like-status.dto';
import { SaBasicAuthGuard } from '../../auth/guards/sa-basic-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NoneStatusGuard } from '../../auth/guards/none-status.guard';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { ChangeLikeStatusPostCommand } from '../application/use-cases/change-likeStatus-post.use-case';
import { PostIdParams } from '../../../common/query/params/postId.params';
import { IdParams } from '../../../common/query/params/id.params';
import { BlogIdPostIdParams } from '../../../common/query/params/blogId-postId.params';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { PaginatorDto } from '../../../common/helpers/paginator.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { UpdatePostWithBlogIdDto } from '../dto/update-post-with-blog-id.dto';
import { CreatePostWithBlogIdDto } from '../dto/create-post-with-blog-id.dto';
import { PostExistValidationPipe } from '../../../common/pipes/post-exist-validation.pipe';
import { DeletePostByIdCommand } from '../application/use-cases/delete-post-by-id.use-case';
import { CommentViewModel } from '../../comments/views/comment.view-model';
import { PostWithLikesInfoViewModel } from '../views/post-with-likes-info.view-model';
import { LikeStatusPostsEntity } from '../entities/like-status-posts.entity';
import { GetCommentsByPostIdCommand } from '../../comments/application/use-cases/get-comments-by-post-id.use-case';
import { GetPostByIdCommand } from '../application/use-cases/get-post-by-id.use-case';
import { GetPostsCommand } from '../application/use-cases/get-posts.use-case';
import { UpdatePostByPostIdCommand } from '../application/use-cases/update-post-by-post-id.use-case';
import { PostWithLikesImagesInfoViewModel } from '../views/post-with-likes-images-info.view-model';
import { ApiTags } from '@nestjs/swagger';

@SkipThrottle()
@ApiTags('Posts')
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
  ): Promise<PaginatorDto> {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);
    return await this.commandBus.execute(
      new GetPostsCommand(queryData, currentUserDto),
    );
  }

  @Get(':id')
  @UseGuards(NoneStatusGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async openFindPostById(
    @Request() req: any,
    @Param('id', PostExistValidationPipe) id: string,
  ): Promise<PostWithLikesImagesInfoViewModel> {
    const currentUserDto: CurrentUserDto | null = req.user;

    return await this.commandBus.execute(
      new GetPostByIdCommand(id, currentUserDto),
    );
  }

  @Get(':postId/comments')
  @UseGuards(AbilitiesGuard)
  @UseGuards(NoneStatusGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async getCommentsByPostId(
    @Request() req: any,
    @Param() params: PostIdParams,
    @Query() query: any,
  ): Promise<PaginatorDto> {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetCommentsByPostIdCommand(params.postId, queryData, currentUserDto),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async createPost(
    @Request() req: any,
    @Body() createPostWithBlogIdDto: CreatePostWithBlogIdDto,
  ): Promise<PostWithLikesInfoViewModel> {
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
  ): Promise<CommentViewModel> {
    const currentUserDto: CurrentUserDto = req.user;
    return await this.commandBus.execute(
      new CreateCommentCommand(params.postId, createCommentDto, currentUserDto),
    );
  }

  @Put(':id')
  @UseGuards(SaBasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByPostId(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updatePostWithBlogIdDto: UpdatePostWithBlogIdDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    const { blogId, ...updatePostDto } = updatePostWithBlogIdDto;
    const postIdBlogId: BlogIdPostIdParams = {
      postId: params.id,
      blogId: blogId,
    };

    return await this.commandBus.execute(
      new UpdatePostByPostIdCommand(
        postIdBlogId,
        updatePostDto,
        currentUserDto,
      ),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SaBasicAuthGuard)
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
  ): Promise<LikeStatusPostsEntity> {
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
