import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { PaymentsStatusEnum } from '../enums/payments-status.enum';
import { PaymentSystem } from '../../payment/enums/payment-system.enums';
import { OrdersEntity } from './orders.entity';

@Entity('PaymentTransactions')
export class PaymentTransactionsEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  id: string;

  @Column({ type: 'bigint' }) // Storing price in cents as a bigint to avoid floating-point errors
  priceInCents: number;

  @Column({
    type: 'enum',
    enum: PaymentSystem,
    default: PaymentSystem.STRIPE,
    nullable: false,
  })
  paymentSystem: PaymentSystem;

  @Column({
    type: 'enum',
    enum: PaymentsStatusEnum,
    default: PaymentsStatusEnum.PENDING,
    nullable: false,
  })
  status: PaymentsStatusEnum;

  @Column({ type: 'character varying', length: 50, nullable: false })
  createdAt: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  updatedAt: string;

  @Column({ type: 'json', nullable: true })
  paymentProviderInfoJson: any;

  @Column({ type: 'json', nullable: true })
  anyConfirmPaymentSystemData: any;

  @ManyToOne(() => OrdersEntity, (order) => order.payments)
  order: OrdersEntity;
}
