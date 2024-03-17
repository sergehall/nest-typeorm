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

@Entity('Orders')
export class OrdersEntity {
  @PrimaryColumn('uuid', { nullable: false })
  orderId: string;

  @Column({ type: 'simple-array' }) // assuming product IDs are stored as an array of strings
  productIds: string[];

  @Column({ type: 'json', nullable: true })
  anyConfirmPaymentSystemData: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'character varying', nullable: false })
  createdAt: string;

  @Column({ type: 'character varying', nullable: false })
  updatedAt: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'orderOwnerId', referencedColumnName: 'userId' })
  postOwner: UsersEntity;

  @OneToMany(() => PaymentTransactionsEntity, (payment) => payment.order)
  payments: PaymentTransactionsEntity[];

  @OneToMany(() => OrderItemsEntity, (item) => item.order)
  items: OrderItemsEntity[];
}
