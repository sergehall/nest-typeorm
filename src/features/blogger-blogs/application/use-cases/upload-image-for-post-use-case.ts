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
import { PostsImagesFileMetadataRepo } from '../../../posts/infrastructure/posts-images-file-metadata.repo';

export class UploadImageForPostCommand {
  constructor(
    public params: BlogIdPostIdParams,
    public fileUploadDto: FileUploadDtoDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(UploadImageForPostCommand)
export class UploadImageForPostUseCase
  implements ICommandHandler<UploadImageForPostCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected postsRepo: PostsRepo,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected fileStorageAdapter: FileStorageAdapter,
    protected fileMetadataService: FileMetadataService,
    protected postsImagesFileMetadataRepo: PostsImagesFileMetadataRepo,
  ) {}

  async execute(
    command: UploadImageForPostCommand,
  ): Promise<PostImagesViewModel> {
    const { params, fileUploadDto, currentUserDto } = command;
    const { blogId, postId } = params;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findNotBannedBlogById(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    const post: PostsEntity | null =
      await this.postsRepo.getPostByIdWithoutLikes(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    await this.userPermission(blog.blogOwner.userId, currentUserDto);

    const metadata: FileMetadata =
      await this.fileMetadataService.extractFromBuffer(fileUploadDto.buffer);

    const urlEtagDto: UrlEtagDto =
      await this.fileStorageAdapter.uploadFileForPost(
        params,
        fileUploadDto,
        currentUserDto,
      );

    await this.postsImagesFileMetadataRepo.createPostsImagesFileMetadata(
      blog,
      post,
      fileUploadDto,
      urlEtagDto,
      currentUserDto,
    );

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
