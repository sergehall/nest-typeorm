import { IsString, IsUrl } from 'class-validator';

export class PaymentLinkDto {
  @IsString()
  @IsUrl()
  paymentLink: string;
}
