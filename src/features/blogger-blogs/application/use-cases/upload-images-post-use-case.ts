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
import { FileUploadDtoDto } from '../../dto/file-upload.dto';
import { FileStorageAdapter } from '../../../../common/file-storage-adapter/file-storage-adapter';
import { PostImagesViewModel } from '../../views/post-images.view-model';
import { FileMetadataService } from '../../../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { FileMetadata } from '../../../../common/helpers/file-metadata-from-buffer.service/dto/file-metadata';
import { UrlEtagDto } from '../../dto/url-etag.dto';
import { ImagesFileMetadataRepo } from '../../../posts/infrastructure/images-file-metadata.repo';

export class UploadImagesPostCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public fileUploadDto: FileUploadDtoDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

/** Command handler for the UploadImageForPostCommand. */
@CommandHandler(UploadImagesPostCommand)
export class UploadImagesPostUseCase
  implements ICommandHandler<UploadImagesPostCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepo: PostsRepo,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected fileStorageAdapter: FileStorageAdapter,
    protected fileMetadataService: FileMetadataService,
    protected postsImagesFileMetadataRepo: ImagesFileMetadataRepo,
  ) {}

  /**
   * Execute method to handle the command.
   * @param command The UploadImageForPostCommand.
   * @returns A promise that resolves to the post images view model.
   */
  async execute(
    command: UploadImagesPostCommand,
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

    // Extract file metadata
    const metadata: FileMetadata =
      await this.fileMetadataService.extractFromBuffer(fileUploadDto.buffer);

    // Upload file for the post to s3
    const urlEtagDto: UrlEtagDto =
      await this.fileStorageAdapter.uploadFileImagePost(
        params,
        fileUploadDto,
        currentUserDto,
      );

    // Create post images file metadata into postgresSql
    await this.postsImagesFileMetadataRepo.createPostsImagesFileMetadata(
      blog,
      post,
      fileUploadDto,
      urlEtagDto,
      currentUserDto,
    );

    // Return post images view model
    return {
      main: [
        {
          url: urlEtagDto.url,
          width: metadata.width,
          height: metadata.height,
          fileSize: metadata.fileSize,
        },
      ],
    };
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
