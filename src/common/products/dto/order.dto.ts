import { IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { PaymentSystem } from '../../payment/enums/payment-system.enums';
import { Column } from 'typeorm';
import { Currency } from '../../payment/enums/currency.enums';

export class OrderDto {
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
  unit_amount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalPrice: string;

  @IsString()
  clientId: string;

  @IsString()
  createdAt: string;

  @IsEnum(PaymentSystem)
  anyConfirmPaymentSystemData: PaymentSystem;
}
