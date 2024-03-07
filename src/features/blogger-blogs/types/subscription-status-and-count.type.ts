import { IsEnum, IsNotEmpty, IsNumber, Length } from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enums';

export class SubscriptionStatusAndCountType {
  @IsNotEmpty()
  @Length(0, 60, {
    message: 'Incorrect blogId length! Must be max 60 characters.',
  })
  blogId: string;
  @IsNotEmpty()
  @Length(0, 60, {
    message: 'Incorrect subscriberId length! Must be max 60 characters.',
  })
  subscriberId: string;

  @IsEnum(SubscriptionStatus)
  currentUserSubscriptionStatus: SubscriptionStatus = SubscriptionStatus.None;

  @IsNumber()
  subscribersCount: number;
}
