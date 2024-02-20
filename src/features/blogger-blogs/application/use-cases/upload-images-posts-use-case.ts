import { BlogIdPostIdParams } from '../../../../common/query/params/blogId-postId.params';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { PostsRepo } from '../../../posts/infrastructure/posts-repo';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';
import { PostsEntity } from '../../../posts/entities/posts.entity';
import { FileUploadDto } from '../../dto/file-upload.dto';
import { FileStorageAdapter } from '../../../../common/file-storage-adapter/file-storage-adapter';
import { PostImagesViewModel } from '../../../posts/views/post-images.view-model';
import { UrlPathKeyEtagDto } from '../../dto/url-pathKey-etag.dto';
import { ImagesPostsMetadataRepo } from '../../../posts/infrastructure/images-posts-metadata.repo';
import { PostsService } from '../../../posts/application/posts.service';
import { ImagesPostsOriginalMetadataEntity } from '../../../posts/entities/images-post-original-metadata.entity';

export class UploadImagesPostsCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public fileUploadDto: FileUploadDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

/** Command handler for the UploadImageForPostCommand. */
@CommandHandler(UploadImagesPostsCommand)
export class UploadImagesPostsUseCase
  implements ICommandHandler<UploadImagesPostsCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsService: PostsService,
    protected postsRepo: PostsRepo,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected fileStorageAdapter: FileStorageAdapter,
    protected postsImagesFileMetadataRepo: ImagesPostsMetadataRepo,
  ) {}

  /**
   * Execute method to handle the command.
   * @param command The UploadImageForPostCommand.
   * @returns A promise that resolves to the post images view model.
   */
  async execute(
    command: UploadImagesPostsCommand,
  ): Promise<PostImagesViewModel> {
    const { params, fileUploadDto, currentUserDto } = command;
    const { blogId, postId } = params;

    // Check if the blog exists
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findNotBannedBlogById(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    // Check if the post exists
    const post: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check user permission
    await this.userPermission(blog.blogOwner.userId, currentUserDto);

    // Upload file for the post to s3
    const urlPathKeyEtagArr: UrlPathKeyEtagDto[] =
      await this.fileStorageAdapter.uploadFileImagePost(
        params,
        fileUploadDto,
        currentUserDto,
      );

    // Create post images file metadata into postgresSql
    const images =
      await this.postsImagesFileMetadataRepo.createImagesPostsMetadata(
        blog,
        post,
        fileUploadDto,
        urlPathKeyEtagArr[0],
        currentUserDto,
      );

    // const imagesPost: ImagesPostsOriginalMetadataEntity[] =
    //   await this.postsImagesFileMetadataRepo.findImagesPostMain(
    //     post.id,
    //     blog.id,
    //   );

    return await this.postsService.imagesMetadataProcessor([images]);
  }

  /**
   * Check user permission to upload file.
   * @param blogOwnerUserId The ID of the blog owner user.
   * @param currentUserDto The current user DTO.
   * @throws ForbiddenException if user does not have permission.
   * @throws InternalServerErrorException on internal errors.
   */
  private async userPermission(
    blogOwnerUserId: string,
    currentUserDto: CurrentUserDto,
  ): Promise<void> {
    const ability = this.caslAbilityFactory.createForUserId({
      id: blogOwnerUserId,
    });
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.UPDATE, {
        id: currentUserDto.userId,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(
          'You do not have permission to upload file. ' + error.message,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
