import { IsEnum, IsNumber } from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enums';

export class SubscriptionStatusAndCountType {
  @IsEnum(SubscriptionStatus)
  currentUserSubscriptionStatus: SubscriptionStatus = SubscriptionStatus.None;

  @IsNumber()
  subscribersCount: number = 0;
}
