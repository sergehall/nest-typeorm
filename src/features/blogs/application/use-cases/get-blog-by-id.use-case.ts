import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsEntity } from '../../../blogger-blogs/entities/blogger-blogs.entity';
import { ImagesPostsMetadataRepo } from '../../../posts/infrastructure/images-posts-metadata.repo';
import {
  BloggerBlogsWithImagesViewModel,
  Image,
} from '../../../blogger-blogs/views/blogger-blogs-with-images.view-model';
import { FileMetadata } from '../../../../common/helpers/file-metadata-from-buffer.service/dto/file-metadata';
import { FileMetadataService } from '../../../../common/helpers/file-metadata-from-buffer.service/file-metadata-service';
import { S3Service } from '../../../../config/aws/s3/s3-service';
import { UrlDto } from '../../../blogger-blogs/dto/url.dto';

export class GetBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected imagesPostsMetadataRepo: ImagesPostsMetadataRepo,
    protected fileMetadataService: FileMetadataService,
    protected s3Service: S3Service,
    protected commandBus: CommandBus,
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

    const imagesBlogsWallpaper =
      await this.imagesPostsMetadataRepo.findImageBlogWallpaperById(blog.id);

    const imageBlogMain =
      await this.imagesPostsMetadataRepo.findImageBlogMainById(blog.id);

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
