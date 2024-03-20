import { IsString, IsNumber, Min, IsEnum, IsObject } from 'class-validator';
import { Column } from 'typeorm';
import { Currency } from '../enums/currency.enums';
import { PaymentSystem } from '../enums/payment-system.enums';
import { CurrentUserDto } from '../../features/users/dto/current-user.dto';
import { GuestUsersDto } from '../../features/users/dto/guest-users.dto';

export class PaymentDto {
  @IsString()
  orderId: string;

  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @Min(1)
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitAmount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalPrice: string;

  @IsObject()
  client: CurrentUserDto | GuestUsersDto;

  @IsString()
  createdAt: string;

  @IsEnum(PaymentSystem)
  paymentSystem: PaymentSystem;
}
