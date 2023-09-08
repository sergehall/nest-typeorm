import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard';
import { AbilitiesGuard } from '../../../ability/abilities.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { Action } from '../../../ability/roles/action.enum';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../users/application/use-cases/create-user.use-case';
import { IdParams } from '../../../common/query/params/id.params';
import { SaBanUserDto } from '../dto/sa-ban-user..dto';
import { SaBanBlogDto } from '../dto/sa-ban-blog.dto';
import { CurrentUserDto } from '../../users/dto/currentUser.dto';
import { IdUserIdParams } from '../../../common/query/params/id-userId.params';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ReturnUsersBanInfoEntity } from '../entities/return-users-banInfo.entity';
import { SaBanUnbanBlogCommand } from '../application/use-cases/sa-ban-unban-blog-for-user.use-case';
import { SaBanUnbanUserCommand } from '../application/use-cases/sa-ban-unban-user.use-case';
import { SaBindBlogWithUserCommand } from '../application/use-cases/sa-bind-blog-with-user.use-case';
import { PaginatedResultDto } from '../../../common/pagination/dto/paginated-result.dto';
import { UsersEntity } from '../../users/entities/users.entity';
import { ChangeRoleCommand } from '../application/use-cases/sa-change-role.use-case';
import { SaFindUsersCommand } from '../application/use-cases/sa-find-users.use-case';
import { SaDeleteUserByUserIdCommand } from '../application/use-cases/sa-delete-user-by-user-id.use-case';
import { CreateBlogsDto } from '../../blogger-blogs/dto/create-blogs.dto';
import { SaCreateBlogCommand } from '../application/use-cases/sa-create-blog.use-case';
import { BlogExistValidationPipe } from '../../../common/pipes/blog-exist-validation.pipe';
import { SaUpdateBlogByIdCommand } from '../application/use-cases/sa-update-blog-by-id.use-case';
import { SaDeleteBlogByBlogIdCommand } from '../application/use-cases/sa-delete-blog-by-id.use-case';
import { BlogIdParams } from '../../../common/query/params/blogId.params';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { ReturnPostsEntity } from '../../posts/entities/return-posts.entity';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { SearchPostsInBlogCommand } from '../../posts/application/use-cases/search-posts-in-blog.use-case';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { SaBlogIdPostIdParams } from '../../../common/query/params/sa-blog-id-post-id.params';
import { SaUpdatePostsByPostIdCommand } from '../application/use-cases/sa-update-post.use-case';
import { SaDeletePostByPostIdCommand } from '../application/use-cases/sa-delete-post-by-post-id.use-case';

@SkipThrottle()
@Controller('sa')
export class SaController {
  constructor(
    private parseQueriesService: ParseQueriesService,
    private commandBus: CommandBus,
  ) {}

  @Get('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async saFindUsers(@Query() query: any): Promise<PaginatedResultDto> {
    const queryData = await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(new SaFindUsersCommand(queryData));
  }

  @Get('blogs')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async searchBlogsForSa(@Query() query: any): Promise<PaginatedResultDto> {
    const queryData = await this.parseQueriesService.getQueriesData(query);
    return await this.commandBus.execute(new SaFindUsersCommand(queryData));
  }

  @Get('blogs/:blogId/posts')
  @UseGuards(BaseAuthGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async saSearchPostsInBlog(
    @Request() req: any,
    @Param('blogId', BlogExistValidationPipe) blogId: string,
    @Query() query: any,
  ): Promise<PaginatedResultDto> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new SearchPostsInBlogCommand(blogId, queryData, currentUserDto),
    );
  }

  @Post('users')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async saCreateUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ReturnUsersBanInfoEntity> {
    const newUser: UsersEntity = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );

    return await this.commandBus.execute(new ChangeRoleCommand(newUser.userId));
  }

  @Post('blogs')
  @UseGuards(BaseAuthGuard)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.CREATE, subject: CurrentUserDto })
  async saCreateBlog(
    @Request() req: any,
    @Body() createBlogsDto: CreateBlogsDto,
  ): Promise<ReturnUsersBanInfoEntity> {
    const currentUserDto = req.user;

    return await this.commandBus.execute(
      new SaCreateBlogCommand(createBlogsDto, currentUserDto),
    );
  }

  @Put('blogs/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saBanBlog(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() saBanBlogDto: SaBanBlogDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;

    return await this.commandBus.execute(
      new SaBanUnbanBlogCommand(params.id, saBanBlogDto, currentUserDto),
    );
  }

  @Post('blogs/:blogId/posts')
  @UseGuards(BaseAuthGuard)
  async saCreatePostInBlog(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Body() createPostDto: CreatePostDto,
  ): Promise<ReturnPostsEntity> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new CreatePostCommand(params.blogId, createPostDto, currentUserDto),
    );
  }

  @Put('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saUpdateBlogById(
    @Request() req: any,
    @Param('id', BlogExistValidationPipe) id: string,
    @Body() updateBlogDto: CreateBlogsDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaUpdateBlogByIdCommand(id, updateBlogDto, currentUserDto),
    );
  }

  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saUpdatePostByPostId(
    @Request() req: any,
    @Param() params: SaBlogIdPostIdParams,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaUpdatePostsByPostIdCommand(params, updatePostDto, currentUserDto),
    );
  }

  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saBanUnbanUser(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateSaBanDto: SaBanUserDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;

    return await this.commandBus.execute(
      new SaBanUnbanUserCommand(params.id, updateSaBanDto, currentUserDto),
    );
  }

  @Put('blogs/:id/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async bindBlogWithUser(
    @Request() req: any,
    @Param() params: IdUserIdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaBindBlogWithUserCommand(params, currentUserDto),
    );
  }

  @Put('blogs/:id/ban-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async banBlogWithUser(
    @Request() req: any,
    @Param() params: IdUserIdParams,
    @Body() updateSaBanDto: SaBanUserDto,
  ): Promise<boolean> {
    const currentUserDto = req.user;
    return await this.commandBus.execute(
      new SaBanUnbanUserCommand(params.id, updateSaBanDto, currentUserDto),
    );
  }

  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saDeletePostByPostId(
    @Request() req: any,
    @Param() params: SaBlogIdPostIdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaDeletePostByPostIdCommand(params, currentUserDto),
    );
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async deleteUserById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaDeleteUserByUserIdCommand(params.id, currentUserDto),
    );
  }

  @Delete('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BaseAuthGuard)
  async saDeleteBlogById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new SaDeleteBlogByBlogIdCommand(params.id, currentUserDto),
    );
  }
}
