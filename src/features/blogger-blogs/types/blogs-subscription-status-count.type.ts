import { IsEnum, IsNotEmpty, IsNumber, Length } from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enums';

export class BlogsSubscriptionStatusCountType {
  @IsNotEmpty()
  @Length(0, 60, {
    message: 'Incorrect blogId length! Must be max 60 characters.',
  })
  blogId: string;

  @IsEnum(SubscriptionStatus)
  currentUserSubscriptionStatus: SubscriptionStatus = SubscriptionStatus.None;

  @IsNumber()
  subscribersCount: number;
}
