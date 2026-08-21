import { IsEnum, IsNotEmpty, IsNumber, Length } from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enums';

export class BlogIdSubscriptionStatusAndCountType {
  @IsNotEmpty()
  @Length(0, 60, {
    message: 'Incorrect blogId length! Must be max 60 ch.',
  })
  blogId: string;
  @IsNotEmpty()
  @Length(0, 60, {
    message: 'Incorrect subscriberId length! Must be max 60 ch.',
  })
  subscriberId: string;
  @IsEnum(SubscriptionStatus)
  currentUserSubscriptionStatus: SubscriptionStatus = SubscriptionStatus.None;
  @IsNumber()
  subscribersCount: number = 0;
}
