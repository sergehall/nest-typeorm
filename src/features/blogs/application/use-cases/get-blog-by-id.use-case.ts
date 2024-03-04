import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';
import { BloggerBlogsWithImagesViewModel } from '../../../blogger-blogs/views/blogger-blogs-with-images.view-model';
import { ImagesBlogsWallpaperMetadataRepo } from '../../../blogger-blogs/infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from '../../../blogger-blogs/infrastructure/images-blogs-main-metadata.repo';
import { FilesMetadataService } from '../../../../adapters/media-services/files/files-metadata.service';
import { ImageMetadata } from '../../../../adapters/media-services/files/dto/image-metadata';

export class GetBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    protected commandBus: CommandBus,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected imagesMetadataService: FilesMetadataService,
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

    const wallpaper: ImageMetadata | null =
      imageWallpaperMetadataEntity &&
      (await this.imagesMetadataService.processImageBlogsWallpaperOrMain(
        imageWallpaperMetadataEntity,
      ));

    const main: ImageMetadata[] = [];
    if (imageMainMetadataEntity) {
      main.push(
        await this.imagesMetadataService.processImageBlogsWallpaperOrMain(
          imageMainMetadataEntity,
        ),
      );
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
}
