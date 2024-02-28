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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBloggerBlogCommand } from '../application/use-cases/create-blogger-blog.use-case';
import { UpdateBlogByIdCommand } from '../application/use-cases/update-blog-by-id.use-case';
import { DeleteBlogByBlogIdCommand } from '../application/use-cases/delete-blog-by-blog-id.use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { BlogIdParams } from '../../../common/query/params/blogId.params';
import { IdParams } from '../../../common/query/params/id.params';
import { BlogIdPostIdParams } from '../../../common/query/params/blogId-postId.params';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { CheckAbilities } from '../../../ability/abilities.decorator';
import { Action } from '../../../ability/roles/action.enum';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { SkipThrottle } from '@nestjs/throttler';
import { PaginatorDto } from '../../../common/helpers/paginator.dto';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { SearchBannedUsersInBlogCommand } from '../application/use-cases/search-banned-users-in-blog.use.case';
import { ManageBlogAccessCommand } from '../application/use-cases/manage-blog-access.use-case';
import { GetBlogsOwnedByCurrentUserCommand } from '../application/use-cases/get-blogs-owned-by-current-user.use-case';
import { BlogExistValidationPipe } from '../../../common/pipes/blog-exist-validation.pipe';
import { DeletePostByPostIdAndBlogIdCommand } from '../../posts/application/use-cases/delete-post-by-post-id-and-blog-id.use-case';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { GetPostsInBlogCommand } from '../../posts/application/use-cases/get-posts-in-blog.use-case';
import { GetCommentsByUserIdCommand } from '../application/use-cases/get-comments-by-user-id.use-case';
import { UpdatePostByPostIdCommand } from '../../posts/application/use-cases/update-post-by-post-id.use-case';
import { Express } from 'express';
import { FileUploadDto } from '../dto/file-upload.dto';
import { PostImagesViewModel } from '../../posts/views/post-images.view-model';
import { BloggerBlogsWithImagesViewModel } from '../views/blogger-blogs-with-images.view-model';
import { FileValidationPipe } from '../../../common/pipes/file-validation.pipe';
import { getFileConstraints } from '../../../common/pipes/file-constraints/file-constraints';
import { UploadImageBlogWallpaperCommand } from '../application/use-cases/upload-files-blogs-wallpaper-use-case';
import { UploadImagesPostsCommand } from '../application/use-cases/upload-files-posts-use-case';
import { PostWithLikesImagesInfoViewModel } from '../../posts/views/post-with-likes-images-info.view-model';
import { UploadFilesBlogsMainCommand } from '../application/use-cases/upload-files-blogs-main-use-case';

@SkipThrottle()
@Controller('blogger')
export class BloggerBlogsController {
  constructor(
    protected parseQueriesService: ParseQueriesService,
    protected commandBus: CommandBus,
  ) {}
  @Post('blogs/:blogId/posts/:postId/files/main')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageForPost(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
    @UploadedFile(new FileValidationPipe(getFileConstraints.imagePost))
    file: Express.Multer.File,
  ): Promise<PostImagesViewModel> {
    const currentUserDto: CurrentUserDto = req.user;
    const fileUpload: FileUploadDto = file;

    return await this.commandBus.execute(
      new UploadImagesPostsCommand(params, fileUpload, currentUserDto),
    );
  }

  @Post('blogs/:blogId/files/wallpaper')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageBlogWallpaper(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @UploadedFile(new FileValidationPipe(getFileConstraints.imageBlogWallpaper))
    file: Express.Multer.File,
  ): Promise<PostImagesViewModel> {
    const currentUserDto: CurrentUserDto = req.user;
    const fileUploadDto: FileUploadDto = file;

    return await this.commandBus.execute(
      new UploadImageBlogWallpaperCommand(
        params,
        fileUploadDto,
        currentUserDto,
      ),
    );
  }

  @Post('blogs/:blogId/files/main')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFilesBlogMain(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @UploadedFile(new FileValidationPipe(getFileConstraints.imageBlogMain))
    file: Express.Multer.File,
  ): Promise<PostImagesViewModel> {
    const currentUserDto: CurrentUserDto = req.user;
    const fileUploadDto: FileUploadDto = file;

    return await this.commandBus.execute(
      new UploadFilesBlogsMainCommand(params, fileUploadDto, currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('blogs')
  async getBlogsOwnedByCurrentUser(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginatorDto> {
    const currentUserDto: CurrentUserDto = req.user;

    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetBlogsOwnedByCurrentUserCommand(queryData, currentUserDto),
    );
  }

  @Get('blogs/comments')
  @UseGuards(JwtAuthGuard)
  async getCommentsOwnedByCurrentUser(
    @Request() req: any,
    @Query() query: any,
  ): Promise<PaginatorDto> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetCommentsByUserIdCommand(queryData, currentUserDto),
    );
  }

  @Post('blogs')
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Request() req: any,
    @Body() createBBlogsDto: CreateBlogsDto,
  ): Promise<BloggerBlogsWithImagesViewModel> {
    const currentUserDto = req.user;

    return await this.commandBus.execute(
      new CreateBloggerBlogCommand(createBBlogsDto, currentUserDto),
    );
  }

  @Put('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateBlogById(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateBlogDto: CreateBlogsDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new UpdateBlogByIdCommand(params.id, updateBlogDto, currentUserDto),
    );
  }

  @Get('blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  @CheckAbilities({ action: Action.READ, subject: CurrentUserDto })
  async getPostsInBlog(
    @Request() req: any,
    @Param('blogId', BlogExistValidationPipe) blogId: string,
    @Query() query: any,
  ): Promise<PaginatorDto> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);

    return await this.commandBus.execute(
      new GetPostsInBlogCommand(blogId, queryData, currentUserDto),
    );
  }

  @Post('blogs/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostInBlog(
    @Request() req: any,
    @Param() params: BlogIdParams,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostWithLikesImagesInfoViewModel> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new CreatePostCommand(params.blogId, createPostDto, currentUserDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/blog/:id')
  async searchBannedUsersInBlog(
    @Request() req: any,
    @Param() params: IdParams,
    @Query() query: any,
  ): Promise<PaginatorDto> {
    const currentUserDto: CurrentUserDto = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);
    return await this.commandBus.execute(
      new SearchBannedUsersInBlogCommand(params.id, queryData, currentUserDto),
    );
  }

  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updatePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new UpdatePostByPostIdCommand(params, updatePostDto, currentUserDto),
    );
  }

  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async manageBlogAccess(
    @Request() req: any,
    @Param() params: IdParams,
    @Body() updateBanUserDto: UpdateBanUserDto,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new ManageBlogAccessCommand(params.id, updateBanUserDto, currentUserDto),
    );
  }

  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deletePostByPostId(
    @Request() req: any,
    @Param() params: BlogIdPostIdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new DeletePostByPostIdAndBlogIdCommand(params, currentUserDto),
    );
  }

  @Delete('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteBlogById(
    @Request() req: any,
    @Param() params: IdParams,
  ): Promise<boolean> {
    const currentUserDto: CurrentUserDto = req.user;

    return await this.commandBus.execute(
      new DeleteBlogByBlogIdCommand(params.id, currentUserDto),
    );
  }
}
