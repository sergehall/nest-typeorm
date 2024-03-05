import { Injectable } from '@nestjs/common';
import { BloggerBlogsWithImagesViewModel } from '../../blogger-blogs/views/blogger-blogs-with-images.view-model';
import { BlogIdSubscriptionStatusAndCountType } from '../../blogger-blogs/types/blogId-subscription-status-and-count.type';
import { SubscriptionStatus } from '../../blogger-blogs/enums/subscription-status.enums';

@Injectable()
export class BlogsService {
  async mapBlogsWithImagesAndSubscription(
    blogsWithImages: BloggerBlogsWithImagesViewModel[],
    blogsSubscription: BlogIdSubscriptionStatusAndCountType[],
  ) {
    return blogsWithImages.map((bloggerBlog) => {
      // Find the corresponding BlogIdSubscriptionStatusAndCountType object by blogId
      const blogIdSubscription = blogsSubscription.find(
        (subscription) => subscription.blogId === bloggerBlog.id,
      );

      // Construct the desired object
      return {
        id: bloggerBlog.id,
        name: bloggerBlog.name,
        description: bloggerBlog.description,
        websiteUrl: bloggerBlog.websiteUrl,
        createdAt: bloggerBlog.createdAt,
        isMembership: bloggerBlog.isMembership,
        images: bloggerBlog.images,
        currentUserSubscriptionStatus: blogIdSubscription
          ? blogIdSubscription.currentUserSubscriptionStatus
          : SubscriptionStatus.None,
        subscribersCount: blogIdSubscription
          ? blogIdSubscription.subscribersCount
          : 0,
      };
    });
  }
}
