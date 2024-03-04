import { BloggerBlogsWithImagesViewModel } from './blogger-blogs-with-images.view-model';
import { IsEnum, IsNumber } from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enums';

export class BloggerBlogsWithImagesSubscribersViewModel extends BloggerBlogsWithImagesViewModel {
  @IsEnum(SubscriptionStatus)
  currentUserSubscriptionStatus: SubscriptionStatus = SubscriptionStatus.None;
  @IsNumber()
  subscribersCount: number = 0;
}
