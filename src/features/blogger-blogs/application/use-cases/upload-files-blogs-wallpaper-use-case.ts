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
import { BloggerBlogsRepo } from '../../infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../entities/blogger-blogs.entity';
import { FileUploadDto } from '../../dto/file-upload.dto';
import { UrlPathKeyEtagDto } from '../../dto/url-pathKey-etag.dto';
import { BlogIdParams } from '../../../../common/query/params/blogId.params';
import { ImagesViewModel } from '../../views/blogger-blogs-with-images.view-model';
import { ImagesBlogsWallpaperMetadataRepo } from '../../infrastructure/images-blogs-wallpaper-metadata.repo';
import { FilesStorageAdapter } from '../../../../adapters/media-services/files-storage-adapter';
import { FilesMetadataService } from '../../../../adapters/media-services/files/files-metadata.service';
import { ImageWidthHeightSize } from '../../../../adapters/media-services/files/dto/image-width-height-size';

export class UploadFilesBlogWallpaperCommand {
  constructor(
    public params: BlogIdParams,
    public fileUploadDto: FileUploadDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

/** Command handler for the UploadImageBlogWallpaperCommand. */
@CommandHandler(UploadFilesBlogWallpaperCommand)
export class UploadFilesBlogsWallpaperUseCase
  implements ICommandHandler<UploadFilesBlogWallpaperCommand>
{
  constructor(
    protected caslAbilityFactory: CaslAbilityFactory,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected filesStorageAdapter: FilesStorageAdapter,
    protected filesMetadataService: FilesMetadataService,
    protected imagesBlogsWallpaperMetadataRepo: ImagesBlogsWallpaperMetadataRepo,
  ) {}

  async execute(
    command: UploadFilesBlogWallpaperCommand,
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
      await this.filesMetadataService.extractWidthHeightSizeFromBuffer(
        fileUploadDto.buffer,
      );

    // Upload file for the post to s3
    const urlPathKeyEtagDto: UrlPathKeyEtagDto =
      await this.filesStorageAdapter.uploadFileImageBlogWallpaper(
        params,
        fileUploadDto,
        currentUserDto,
      );

    // Create post files file metadata into postgresSql
    await this.imagesBlogsWallpaperMetadataRepo.createImagesBlogWallpaper(
      blog,
      fileUploadDto,
      urlPathKeyEtagDto,
      currentUserDto,
    );

    // Return post files view model
    return {
      wallpaper: {
        url: urlPathKeyEtagDto.url,
        width: metadata.width,
        height: metadata.height,
        fileSize: metadata.fileSize,
      },
      main: [],
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
