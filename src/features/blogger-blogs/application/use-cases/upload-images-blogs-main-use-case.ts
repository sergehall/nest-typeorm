import { BlogIdParams } from '../../../../common/query/params/blogId.params';
import { FileUploadDto } from '../../dto/file-upload.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CaslAbilityFactory } from '../../../../ability/casl-ability.factory';
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { FileStorageAdapter } from '../../../../common/media-services/file-storage-adapter';
import { ImagesViewModel } from '../../views/blogger-blogs-with-images.view-model';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UrlPathKeyEtagDto } from '../../dto/url-pathKey-etag.dto';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../../../../ability/roles/action.enum';
import { UploadImageBlogWallpaperCommand } from './upload-images-blogs-wallpaper-use-case';
import { ImagesBlogsMainMetadataRepo } from '../../infrastructure/images-blogs-main-metadata.repo';
import { ImagesMetadataService } from '../../../../common/media-services/images/images-metadata.service';
import { ImageWidthHeightSize } from '../../../../common/media-services/images/dto/image-width-height-size';

export class UploadImagesBlogsMainCommand {
  constructor(
    public params: BlogIdParams,
    public fileUploadDto: FileUploadDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(UploadImagesBlogsMainCommand)
export class UploadImagesBlogsMainUseCase
  implements ICommandHandler<UploadImagesBlogsMainCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected fileStorageAdapter: FileStorageAdapter,
    protected imagesMetadataService: ImagesMetadataService,
    protected imagesBlogsMainMetadataRepo: ImagesBlogsMainMetadataRepo,
  ) {}

  async execute(
    command: UploadImageBlogWallpaperCommand,
  ): Promise<ImagesViewModel> {
    const { params, fileUploadDto, currentUserDto } = command;
    const { blogId } = params;

    // Check if the blog exists
    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findNotBannedBlogById(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    // Check user permission
    await this.userPermission(blog.blogOwner.userId, currentUserDto);

    // Extract file metadata
    const metadata: ImageWidthHeightSize =
      await this.imagesMetadataService.extractWidthHeightSizeFromBuffer(
        fileUploadDto.buffer,
      );

    // Upload file for the post to s3
    const urlEtagDto: UrlPathKeyEtagDto =
      await this.fileStorageAdapter.uploadFileImageBlogMain(
        params,
        fileUploadDto,
        currentUserDto,
      );

    // Create post images file metadata into postgresSql
    await this.imagesBlogsMainMetadataRepo.createImagesBlogMain(
      blog,
      fileUploadDto,
      urlEtagDto,
      currentUserDto,
    );

    // Return post images view model
    return {
      wallpaper: null,
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
