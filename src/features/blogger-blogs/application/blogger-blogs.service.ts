import { Injectable } from '@nestjs/common';
import { BloggerBlogsEntity } from '../entities/blogger-blogs.entity';
import { BloggerBlogsViewModel } from '../views/blogger-blogs.view-model';
import {
  BloggerBlogsWithImagesViewModel,
  ImagesViewModel,
} from '../views/blogger-blogs-with-images.view-model';
import { UrlDto } from '../dto/url.dto';
import { S3Service } from '../../../config/aws/s3/s3-service';
import { ImagesBlogsWallpaperMetadataRepo } from '../infrastructure/images-blogs-wallpaper-metadata.repo';
import { ImagesBlogsMainMetadataRepo } from '../infrastructure/images-blogs-main-metadata.repo';
import { FilesMetadataService } from '../../../adapters/media-services/files/files-metadata.service';
import { ImageWidthHeightSize } from '../../../adapters/media-services/files/dto/image-width-height-size';
import { ImageMetadata } from '../../../adapters/media-services/files/dto/image-metadata';
import { SubscriptionStatus } from '../enums/subscription-status.enums';
import { BloggerBlogsWithImagesSubscribersViewModel } from '../views/blogger-blogs-with-images-subscribers.view-model';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { SubscriptionStatusAndCountType } from '../types/subscription-status-and-count.type';

@Injectable()
export class BloggerBlogsService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly imagesMetadataService: FilesMetadataService,
    private readonly imagesBlogsMainMetadataRepo: ImagesBlogsMainMetadataRepo,
    private readonly imagesBlogsWallpaperMetadataRepo: ImagesBlogsWallpaperMetadataRepo,
  ) {}

  async mapBlogsWithImagesAndSubscription(
    blogsWithImages: BloggerBlogsWithImagesViewModel[],
    blogsSubscription: SubscriptionStatusAndCountType[],
    currentUserDto: CurrentUserDto | null,
  ): Promise<BloggerBlogsWithImagesSubscribersViewModel[]> {
    const currSubscriberId = currentUserDto?.userId;
    console.log(blogsSubscription, 'blogsSubscription');
    const mappedBlogs = await Promise.all(
      blogsWithImages.map(async (bloggerBlog) => {
        // Find the corresponding BlogIdSubscriptionStatusAndCountType object by blogId
        const blogIdSubscription = blogsSubscription.find(
          (subscription) => bloggerBlog.id === subscription.blogId,
        );

        let subscriptionStatus: SubscriptionStatus = SubscriptionStatus.None;

        if (
          blogIdSubscription &&
          blogIdSubscription.subscriberId === currSubscriberId
        ) {
          subscriptionStatus = blogIdSubscription.currentUserSubscriptionStatus;
        }

        // Construct the desired object
        return {
          id: bloggerBlog.id,
          name: bloggerBlog.name,
          description: bloggerBlog.description,
          websiteUrl: bloggerBlog.websiteUrl,
          createdAt: bloggerBlog.createdAt,
          isMembership: bloggerBlog.isMembership,
          images: bloggerBlog.images,
          currentUserSubscriptionStatus: subscriptionStatus,
          subscribersCount: blogIdSubscription
            ? blogIdSubscription.subscribersCount
            : 0,
        };
      }),
    );

    return mappedBlogs.reduce(
      (acc: BloggerBlogsWithImagesSubscribersViewModel[], curr) => {
        acc.push(curr);
        return acc;
      },
      [],
    );
  }

  // async mapBlogsWithImagesAndSubscription(
  //   blogsWithImages: BloggerBlogsWithImagesViewModel[],
  //   blogsSubscription: BlogIdSubscriptionStatusAndCountType[],
  // ): Promise<BloggerBlogsWithImagesSubscribersViewModel[]> {
  //   console.log(blogsSubscription, 'blogsSubscription');
  //   return blogsWithImages.map((bloggerBlog) => {
  //     // Find the corresponding BlogIdSubscriptionStatusAndCountType object by blogId
  //     const blogIdSubscription = blogsSubscription.find(
  //       (subscription) => bloggerBlog.id === subscription.blogId,
  //     );
  //
  //     let subscriptionStatus: SubscriptionStatus = SubscriptionStatus.None;
  //     console.log(bloggerBlog.id, 'bloggerBlog.id');
  //     console.log(blogIdSubscription?.blogId, 'blogIdSubscription?.blogI');
  //     console.log(
  //       blogIdSubscription?.currentUserSubscriptionStatus,
  //       'currentUserSubscriptionStatus',
  //     );
  //     console.log(blogIdSubscription?.subscribersCount, 'subscribersCount');
  //     if (
  //       blogIdSubscription &&
  //       (blogIdSubscription.currentUserSubscriptionStatus ===
  //         SubscriptionStatus.Unsubscribed ||
  //         blogIdSubscription.currentUserSubscriptionStatus ===
  //           SubscriptionStatus.Subscribed)
  //     ) {
  //       subscriptionStatus = blogIdSubscription.currentUserSubscriptionStatus;
  //     }
  //     console.log('----------------------------------------------------');
  //
  //     // Construct the desired object
  //     return {
  //       id: bloggerBlog.id,
  //       name: bloggerBlog.name,
  //       description: bloggerBlog.description,
  //       websiteUrl: bloggerBlog.websiteUrl,
  //       createdAt: bloggerBlog.createdAt,
  //       isMembership: bloggerBlog.isMembership,
  //       images: bloggerBlog.images,
  //       currentUserSubscriptionStatus: subscriptionStatus,
  //       subscribersCount: blogIdSubscription
  //         ? blogIdSubscription.subscribersCount
  //         : 0,
  //     };
  //   });
  // }

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
