import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsWithImagesViewModel } from '../../../blogger-blogs/views/blogger-blogs-with-images.view-model';
import { S3Service } from '../../../../config/aws/s3/s3-service';
import { ImagesBlogsWallpaperMetadataRepo } from '../../../blogger-blogs/infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from '../../../blogger-blogs/infrastructure/images-blogs-main-metadata.repo';
import { ImagesBlogsMainMetadataEntity } from '../../../blogger-blogs/entities/images-blog-main-metadata.entity';
import { ImagesBlogsWallpaperMetadataEntity } from '../../../blogger-blogs/entities/images-blog-wallpaper-metadata.entity';
import { ImagesMetadataService } from '../../../../common/media-services/images-metadata.service/images-metadata.service';
import { ImageMetadata } from '../../../../common/media-services/images-metadata.service/dto/image-metadata';

export class GetBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    protected s3Service: S3Service,
    protected commandBus: CommandBus,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected imagesMetadataService: ImagesMetadataService,
    protected imagesBlogsMainMetadataRepo: ImagesBlogsMainMetadataRepo,
    protected imagesBlogsWallpaperMetadataRepo: ImagesBlogsWallpaperMetadataRepo,
  ) {}

  async execute({
    blogId,
  }: GetBlogByIdCommand): Promise<BloggerBlogsWithImagesViewModel> {
    const blog = await this.bloggerBlogsRepo.findBlogById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id: ${blogId} not found`);
    }

    const [imageWallpaperMetadataEntity, imageMainMetadataEntity] =
      await Promise.all([
        this.imagesBlogsWallpaperMetadataRepo.findImageBlogWallpaperById(
          blog.id,
        ),
        this.imagesBlogsMainMetadataRepo.findImageBlogMainById(blog.id),
      ]);

    let wallpaper: ImageMetadata | null = null;
    const main: ImageMetadata[] = [];

    if (imageWallpaperMetadataEntity) {
      wallpaper = await this.processImageMetadata(imageWallpaperMetadataEntity);
    }
    if (imageMainMetadataEntity) {
      main.push(await this.processImageMetadata(imageMainMetadataEntity));
    }

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      images: {
        wallpaper,
        main,
      },
    };
  }

  private async processImageMetadata(
    metadataEntity:
      | ImagesBlogsWallpaperMetadataEntity
      | ImagesBlogsMainMetadataEntity,
  ): Promise<ImageMetadata> {
    const { buffer, pathKey } = metadataEntity;
    const metadata =
      await this.imagesMetadataService.extractWidthHeightSizeFromBuffer(buffer);
    const unitedUrl = await this.s3Service.generateSignedUrl(pathKey);

    return {
      url: unitedUrl.url,
      height: metadata.height,
      width: metadata.width,
      fileSize: metadata.fileSize,
    };
  }
}
