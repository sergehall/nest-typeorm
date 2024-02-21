import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { ImagesPostsOriginalMetadataRepo } from '../../../posts/infrastructure/images-posts-original-metadata.repo';
import {
  BloggerBlogsWithImagesViewModel,
  Image,
} from '../../../blogger-blogs/views/blogger-blogs-with-images.view-model';
import { FileMetadata } from '../../../../common/helpers/file-metadata-from-buffer.service/dto/file-metadata';
import { FileMetadataService } from '../../../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { S3Service } from '../../../../config/aws/s3/s3-service';
import { UrlDto } from '../../../blogger-blogs/dto/url.dto';
import { ImagesBlogsWallpaperMetadataRepo } from '../../../blogger-blogs/infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from '../../../blogger-blogs/infrastructure/images-blogs-main-metadata.repo';
import { ImagesBlogsMainMetadataEntity } from '../../../blogger-blogs/entities/images-blog-main-metadata.entity';
import { ImagesBlogsWallpaperMetadataEntity } from '../../../blogger-blogs/entities/images-blog-wallpaper-metadata.entity';

export class GetBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    protected s3Service: S3Service,
    protected commandBus: CommandBus,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected imagesPostsMetadataRepo: ImagesPostsOriginalMetadataRepo,
    protected fileMetadataService: FileMetadataService,
    protected imagesBlogsMainMetadataRepo: ImagesBlogsMainMetadataRepo,
    protected imagesBlogsWallpaperMetadataRepo: ImagesBlogsWallpaperMetadataRepo,
  ) {}
  async execute(
    command: GetBlogByIdCommand,
  ): Promise<BloggerBlogsWithImagesViewModel> {
    const { blogId } = command;

    const blog: BloggerBlogsEntity | null =
      await this.bloggerBlogsRepo.findBlogById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id: ${blogId} not found`);
    }

    const imagesBlogsWallpaper: ImagesBlogsWallpaperMetadataEntity | null =
      await this.imagesBlogsWallpaperMetadataRepo.findImageBlogWallpaperById(
        blog.id,
      );

    const imageBlogMain: ImagesBlogsMainMetadataEntity | null =
      await this.imagesBlogsMainMetadataRepo.findImageBlogMainById(blog.id);

    let wallpaper: Image | null = null;
    const main: Image[] = [];

    if (imagesBlogsWallpaper) {
      // Extract file metadata
      const metadata: FileMetadata =
        await this.fileMetadataService.extractFromBuffer(
          imagesBlogsWallpaper.buffer,
        );

      const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
        imagesBlogsWallpaper.pathKey,
      );

      wallpaper = {
        url: unitedUrl.url,
        height: metadata.height,
        width: metadata.width,
        fileSize: metadata.fileSize,
      };
    }

    if (imageBlogMain) {
      // Extract file metadata
      const metadata: FileMetadata =
        await this.fileMetadataService.extractFromBuffer(imageBlogMain.buffer);

      const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
        imageBlogMain.pathKey,
      );

      main.push({
        url: unitedUrl.url,
        height: metadata.height,
        width: metadata.width,
        fileSize: metadata.fileSize,
      });
    }

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      images: {
        wallpaper: wallpaper,
        main: main,
      },
    };
  }
}
