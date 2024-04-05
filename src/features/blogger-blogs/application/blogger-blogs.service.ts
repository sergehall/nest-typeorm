import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { BloggerBlogsViewModel } from '../views/blogger-blogs.view-model';
import {
  BloggerBlogsWithImagesViewModel,
  ImagesViewModel,
} from '../views/blogger-blogs-with-images.view-model';
import { UrlDto } from '../dto/url.dto';
import { InitializeS3Client } from '../../../config/aws/s3/initialize-s3-client';
import { ImagesBlogsWallpaperMetadataRepo } from '../infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from '../infrastructure/images-blogs-main-metadata.repo';
import { SubscriptionStatus } from '../enums/subscription-status.enums';
import { BloggerBlogsWithImagesSubscribersViewModel } from '../views/blogger-blogs-with-images-subscribers.view-model';
import { BlogsSubscriptionStatusCountType } from '../types/blogs-subscription-status-count.type';
import { FilesMetadataService } from '../../../adapters/media-services/files/files-metadata.service';
import { ImageMetadata } from '../../../adapters/media-services/files/dto/image-metadata';
import { ImageWidthHeightSize } from '../../../adapters/media-services/files/dto/image-width-height-size';

@Injectable()
export class BloggerBlogsService {
  constructor(
    private readonly s3Service: InitializeS3Client,
    private readonly imagesMetadataService: FilesMetadataService,
    private readonly imagesBlogsMainMetadataRepo: ImagesBlogsMainMetadataRepo,
    private readonly imagesBlogsWallpaperMetadataRepo: ImagesBlogsWallpaperMetadataRepo,
  ) {}

  async mapBlogsWithImagesAndSubscription(
    blogsWithImages: BloggerBlogsWithImagesViewModel[],
    subscriptionStatusAndCountType: BlogsSubscriptionStatusCountType[],
  ): Promise<BloggerBlogsWithImagesSubscribersViewModel[]> {
    return blogsWithImages.map((bloggerBlog) => {
      const blogIdSubscription = subscriptionStatusAndCountType.find(
        (subscription) => bloggerBlog.id === subscription.blogId,
      );
      const subscriptionStatus: SubscriptionStatus = blogIdSubscription
        ? blogIdSubscription.currentUserSubscriptionStatus
        : SubscriptionStatus.None;

      const subscribersCount = blogIdSubscription
        ? blogIdSubscription.subscribersCount
        : 0;

      return {
        id: bloggerBlog.id,
        name: bloggerBlog.name,
        description: bloggerBlog.description,
        websiteUrl: bloggerBlog.websiteUrl,
        createdAt: bloggerBlog.createdAt,
        isMembership: bloggerBlog.isMembership,
        images: bloggerBlog.images,
        currentUserSubscriptionStatus: subscriptionStatus,
        subscribersCount: subscribersCount,
      };
    });
  }

  async addImagesSubscriberToBlogsEntity(
    newBlog: BloggerBlogsViewModel,
  ): Promise<BloggerBlogsWithImagesSubscribersViewModel> {
    const images = new ImagesViewModel();
    const blogsWithImagesSubscribersViewMode =
      new BloggerBlogsWithImagesSubscribersViewModel();
    return {
      ...newBlog,
      images: images,
      currentUserSubscriptionStatus:
        blogsWithImagesSubscribersViewMode.currentUserSubscriptionStatus,
      subscribersCount: blogsWithImagesSubscribersViewMode.subscribersCount,
    };
  }

  async blogsImagesAggregation(
    blogs: BloggerBlogsEntity[],
  ): Promise<BloggerBlogsWithImagesViewModel[]> {
    // Extracting IDs of blogs
    const blogsIds = blogs.map((blog) => blog.id);
    // Array to store aggregated results
    const resultMap: BloggerBlogsWithImagesViewModel[] = [];

    // Fetching image metadata for wallpapers and main files in parallel
    const [imagesBlogsWallpaper, imagesBlogsMain] = await Promise.all([
      this.imagesBlogsWallpaperMetadataRepo.findImagesBlogsWallpaperByIds(
        blogsIds,
      ),
      this.imagesBlogsMainMetadataRepo.findImagesBlogsMainByIds(blogsIds),
    ]);

    // Iterating over each blog to aggregate image data
    for (const blog of blogs) {
      // Retrieving wallpaper metadata for the current blog
      const wallpaperMetadata = imagesBlogsWallpaper[blog.id];
      // Retrieving main image metadata for the current blog
      const mainMetadata = imagesBlogsMain[blog.id];
      // Initializing variables to store image data
      let imageBlogWallpaper: ImageMetadata | null = null;
      const imagesBlogMain: ImageMetadata[] = [];

      // Processing wallpaper image if metadata exists
      if (wallpaperMetadata) {
        // Extracting metadata for wallpaper image
        const metadata: ImageWidthHeightSize =
          await this.imagesMetadataService.extractWidthHeightSizeFromBuffer(
            wallpaperMetadata.buffer,
          );
        // Generating signed URL for wallpaper image
        const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
          wallpaperMetadata.pathKey,
        );
        // Constructing wallpaper image object
        imageBlogWallpaper = {
          url: unitedUrl.url,
          width: metadata.width,
          height: metadata.height,
          fileSize: metadata.fileSize,
        };
      }

      // Processing main files if metadata exists
      if (mainMetadata && mainMetadata.length > 0) {
        // Fetching metadata for main files in parallel
        await Promise.all(
          mainMetadata.map(async (metadata) => {
            // Extracting metadata for main image
            const fileMetadata: ImageWidthHeightSize =
              await this.imagesMetadataService.extractWidthHeightSizeFromBuffer(
                metadata.buffer,
              );
            // Generating signed URL for main image
            const unitedUrl: UrlDto = await this.s3Service.generateSignedUrl(
              metadata.pathKey,
            );
            // Constructing main image object and pushing it to the array
            imagesBlogMain.push({
              url: unitedUrl.url,
              width: fileMetadata.width,
              height: fileMetadata.height,
              fileSize: fileMetadata.fileSize,
            });
          }),
        );
      }

      // Constructing the final result object for the current blog and pushing it to the result array
      resultMap.push({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        images: { wallpaper: imageBlogWallpaper, main: imagesBlogMain },
      });
    }

    // Returning the aggregated results
    return resultMap;
  }

  async transformedBlogs(
    blogsArr: BloggerBlogsEntity[],
  ): Promise<BloggerBlogsViewModel[]> {
    return blogsArr.map((row: BloggerBlogsEntity) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      websiteUrl: row.websiteUrl,
      createdAt: row.createdAt,
      isMembership: row.isMembership,
    }));
  }
}
