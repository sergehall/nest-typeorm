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
import { FileStorageAdapter } from '../../../../common/s3/adapter/file-storage-adapter';
import * as sharp from 'sharp';
import { PostImagesViewModel } from '../../views/post-images.view-model';

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
  ) {}

  async execute(
    command: UploadImageForPostCommand,
  ): Promise<PostImagesViewModel> {
    const { params, fileUploadDto, currentUserDto } = command;

    await this.checkBlogAndPostExistence(params.blogId, params.postId);

    await this.checkUserPermission(params.blogId, currentUserDto);

    const uploadedFile = await this.fileStorageAdapter.uploadFileForPost(
      params,
      fileUploadDto,
      currentUserDto,
    );

    const metadata = await sharp(fileUploadDto.buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const fileSize = fileUploadDto.size;

    return {
      main: [
        {
          url: uploadedFile.url,
          width: width,
          height: height,
          fileSize: fileSize,
        },
      ],
    };
  }

  private async checkBlogAndPostExistence(
    blogId: string,
    postId: string,
  ): Promise<void> {
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
  }

  private async checkUserPermission(
    blogId: string,
    currentUserDto: CurrentUserDto,
  ): Promise<void> {
    const ability = this.caslAbilityFactory.createForUserId({ id: blogId });
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
