import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentTransactionsEntity } from './payment-transaction.entity';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { OrderItemsEntity } from './order-items.entity';
import * as uuid4 from 'uuid4';

@Entity('Orders')
export class OrdersEntity {
  @PrimaryColumn('uuid', { nullable: false })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: string;

  @Column({ type: 'character varying', nullable: false })
  createdAt: string;

  @Column({ type: 'character varying', nullable: true })
  updatedAt: string | null;

  @Column({ type: 'json', nullable: true })
  anyConfirmPaymentSystemData: any;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'clientId', referencedColumnName: 'userId' })
  client: UsersEntity;

  @OneToMany(() => PaymentTransactionsEntity, (payment) => payment.order)
  payments: PaymentTransactionsEntity[];

  @OneToMany(() => OrderItemsEntity, (item) => item.order)
  items: OrderItemsEntity[];

  static createOrderEntity(
    totalPrice: string,
    createdAt: string,
    client: UsersEntity,
    items: OrderItemsEntity[],
    anyConfirmPaymentSystemData?: any,
  ): OrdersEntity {
    const orderEntity = new OrdersEntity();
    orderEntity.orderId = uuid4();
    orderEntity.totalPrice = totalPrice;
    orderEntity.createdAt = createdAt;
    orderEntity.updatedAt = null;
    orderEntity.client = client;
    orderEntity.items = items;
    orderEntity.anyConfirmPaymentSystemData =
      anyConfirmPaymentSystemData || null;
    orderEntity.payments = []; // Assuming payment are initially empty
    return orderEntity;
  }
}
