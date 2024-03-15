import { IsNotEmpty, IsString } from 'class-validator';

export class StripeConfigDto {
  @IsNotEmpty()
  @IsString()
  apiKey: string;
}
