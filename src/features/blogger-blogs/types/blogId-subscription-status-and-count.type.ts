import { IsEnum, IsNotEmpty, IsNumber, Length } from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enums';

export class BlogIdSubscriptionStatusAndCountType {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect blogId length! Must be max 50 ch.',
  })
  blogId: string;
  @IsEnum(SubscriptionStatus)
  currentUserSubscriptionStatus: SubscriptionStatus = SubscriptionStatus.None;
  @IsNumber()
  subscribersCount: number = 0;
}
