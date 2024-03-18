import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { PaymentsStatusEnum } from '../enums/payments-status.enum';
import { OrdersEntity } from './orders.entity';
import * as uuid4 from 'uuid4';
import { PaymentSystem } from '../../../payment/enums/payment-system.enums';

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

  static createPaymentTransactionEntity(
    priceInCents: number,
    paymentSystem: PaymentSystem,
    status: PaymentsStatusEnum,
    createdAt: string,
    updatedAt: string,
    order: OrdersEntity,
    paymentProviderInfoJson?: any,
    anyConfirmPaymentSystemData?: any,
  ): PaymentTransactionsEntity {
    const paymentTransactionEntity = new PaymentTransactionsEntity();
    paymentTransactionEntity.id = uuid4();
    paymentTransactionEntity.priceInCents = priceInCents;
    paymentTransactionEntity.paymentSystem = paymentSystem;
    paymentTransactionEntity.status = status;
    paymentTransactionEntity.createdAt = createdAt;
    paymentTransactionEntity.updatedAt = updatedAt;
    paymentTransactionEntity.order = order;
    paymentTransactionEntity.paymentProviderInfoJson =
      paymentProviderInfoJson || null;
    paymentTransactionEntity.anyConfirmPaymentSystemData =
      anyConfirmPaymentSystemData || null;
    return paymentTransactionEntity;
  }
}
