import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ImagesBlogsWallpaperMetadataRepo } from '../../../blogger-blogs/infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from '../../../blogger-blogs/infrastructure/images-blogs-main-metadata.repo';
import { FilesMetadataService } from '../../../../adapters/media-services/files/files-metadata.service';
import { ImageMetadata } from '../../../../adapters/media-services/files/dto/image-metadata';
import { BlogsSubscribersRepo } from '../../../blogger-blogs/infrastructure/blogs-subscribers.repo';
import { BloggerBlogsWithImagesSubscribersViewModel } from '../../../blogger-blogs/views/blogger-blogs-with-images-subscribers.view-model';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { BloggerBlogsRepo } from '../../../blogger-blogs/infrastructure/blogger-blogs.repo';

export class GetBlogByIdCommand {
  constructor(
    public blogId: string,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(
    protected commandBus: CommandBus,
    protected bloggerBlogsRepo: BloggerBlogsRepo,
    protected blogsSubscribersRepo: BlogsSubscribersRepo,
    protected imagesMetadataService: FilesMetadataService,
    protected imagesBlogsMainMetadataRepo: ImagesBlogsMainMetadataRepo,
    protected imagesBlogsWallpaperMetadataRepo: ImagesBlogsWallpaperMetadataRepo,
  ) {}

  async execute(
    command: GetBlogByIdCommand,
  ): Promise<BloggerBlogsWithImagesSubscribersViewModel> {
    const { blogId, currentUserDto } = command;

    const blog = await this.bloggerBlogsRepo.findBlogById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id: ${blogId} not found`);
    }

    const [
      imageWallpaperMetadataEntity,
      imageMainMetadataEntity,
      subscriptionStatusAndCount,
    ] = await Promise.all([
      this.imagesBlogsWallpaperMetadataRepo.findImageBlogWallpaperById(blog.id),
      this.imagesBlogsMainMetadataRepo.findImageBlogMainById(blog.id),
      this.blogsSubscribersRepo.blogSubscribersAndCount(
        blog.id,
        currentUserDto,
      ),
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
      currentUserSubscriptionStatus:
        subscriptionStatusAndCount.currentUserSubscriptionStatus,
      subscribersCount: subscriptionStatusAndCount.subscribersCount,
    };
  }
}
