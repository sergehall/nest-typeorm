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
import { PostImagesViewModel } from '../../../posts/views/post-images.view-model';
import { UrlsPathKeysEtagsDto } from '../../dto/url-pathKey-etag.dto';
import { ImagesPostsOriginalMetadataRepo } from '../../../posts/infrastructure/images-posts-original-metadata.repo';
import { ResizedImageDetailsDto } from '../../../posts/dto/resized-image-details.dto';
import { KeysPathDto } from '../../../posts/dto/keys-path.dto';
import { OriginalMiddleSmallEntitiesDto } from '../../../posts/dto/original-middle-small-entities.dto';
import { FilesStorageAdapter } from '../../../../adapters/media-services/files-storage-adapter';
import { FilesMetadataService } from '../../../../adapters/media-services/files/files-metadata.service';

export class UploadFilesPostsCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public fileUploadDto: FileUploadDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

/** Command handler for the UploadImageForPostCommand. */
@CommandHandler(UploadFilesPostsCommand)
export class UploadFilesPostsUseCase
  implements ICommandHandler<UploadFilesPostsCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepo: PostsRepo,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected filesStorageAdapter: FilesStorageAdapter,
    protected filesMetadataService: FilesMetadataService,
    protected imagesPostsOriginalMetadataRepo: ImagesPostsOriginalMetadataRepo,
  ) {}

  /**
   * Execute method to handle the command.
   * @param command The UploadImageForPostCommand.
   * @returns A promise that resolves to the post files view model.
   */
  async execute(
    command: UploadFilesPostsCommand,
  ): Promise<PostImagesViewModel> {
    const { params, fileUploadDto, currentUserDto } = command;
    const { blogId, postId } = params;
    const { mimetype } = fileUploadDto;

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

    const resizedImages: ResizedImageDetailsDto =
      await this.filesMetadataService.resizeImages(fileUploadDto);

    const pathsKeys: KeysPathDto =
      await this.filesStorageAdapter.generatePathsKeysForPost(
        currentUserDto.userId,
        blogId,
        postId,
        mimetype,
      );

    // Upload file for the post to s3
    const urlsPathKeysEtagsDto: UrlsPathKeysEtagsDto =
      await this.filesStorageAdapter.uploadFileImagePost(
        resizedImages,
        pathsKeys,
      );

    // Create post file Original Middle Small sizes metadata into postgresSql
    const imagesMetadataEntity: OriginalMiddleSmallEntitiesDto =
      await this.imagesPostsOriginalMetadataRepo.createImagePostOriginalMiddleSmallSizes(
        blog,
        post,
        resizedImages,
        urlsPathKeysEtagsDto,
        currentUserDto,
      );

    return await this.filesMetadataService.processImagePostsMetadata(
      imagesMetadataEntity,
    );
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
