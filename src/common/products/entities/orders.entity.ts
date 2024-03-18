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
import { PaymentSystem } from '../../../payment/enums/payment-system.enums';
import { GuestUsersEntity } from './unregistered-users.entity';

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

  @Column({
    type: 'enum',
    enum: PaymentSystem,
    default: PaymentSystem.STRIPE,
    nullable: false,
  })
  paymentSystem: PaymentSystem;

  @ManyToOne(() => UsersEntity, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  client: UsersEntity | null;

  @ManyToOne(() => GuestUsersEntity, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'guestUserId', referencedColumnName: 'guestUserId' })
  guestClient: GuestUsersEntity | null;

  @OneToMany(() => PaymentTransactionsEntity, (payment) => payment.order)
  payments: PaymentTransactionsEntity[];

  @OneToMany(() => OrderItemsEntity, (item) => item.order)
  items: OrderItemsEntity[];

  static createOrderEntity(
    totalPrice: string,
    createdAt: string,
    paymentSystem: PaymentSystem,
    client: UsersEntity | GuestUsersEntity,
  ): OrdersEntity {
    const orderEntity = new OrdersEntity();
    orderEntity.orderId = uuid4();
    orderEntity.totalPrice = totalPrice;
    orderEntity.paymentSystem = paymentSystem;
    orderEntity.createdAt = createdAt;
    orderEntity.updatedAt = null;
    if (client instanceof UsersEntity) {
      orderEntity.client = client;
      orderEntity.guestClient = null;
    } else {
      orderEntity.guestClient = client;
      orderEntity.client = null;
    }
    return orderEntity;
  }
}

// import {
//   Entity,
//   Column,
//   OneToMany,
//   PrimaryColumn,
//   ManyToOne,
//   JoinColumn,
// } from 'typeorm';
// import { PaymentTransactionsEntity } from './payment-transaction.entity';
// import { UsersEntity } from '../../../features/users/entities/users.entity';
// import { OrderItemsEntity } from './order-items.entity';
// import * as uuid4 from 'uuid4';
// import { PaymentSystem } from '../../../payment/enums/payment-system.enums';
// import { GuestUsersEntity } from './unregistered-users.entity';
//
// @Entity('Orders')
// export class OrdersEntity {
//   @PrimaryColumn('uuid', { nullable: false })
//   orderId: string;
//
//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   totalPrice: string;
//
//   @Column({ type: 'character varying', nullable: false })
//   createdAt: string;
//
//   @Column({ type: 'character varying', nullable: true })
//   updatedAt: string | null;
//
//   @Column({
//     type: 'enum',
//     enum: PaymentSystem,
//     default: PaymentSystem.STRIPE,
//     nullable: false,
//   })
//   paymentSystem: PaymentSystem;
//
//   @ManyToOne(() => UsersEntity, (user) => user.userId, {
//     nullable: false,
//     eager: true,
//   })
//   @JoinColumn({ name: 'clientId', referencedColumnName: 'userId' })
//   client: UsersEntity;
//
//   @OneToMany(() => PaymentTransactionsEntity, (payment) => payment.order)
//   payments: PaymentTransactionsEntity[];
//
//   @OneToMany(() => OrderItemsEntity, (item) => item.order)
//   items: OrderItemsEntity[];
//
//   static createOrderEntity(
//     totalPrice: string,
//     createdAt: string,
//     paymentSystem: PaymentSystem,
//     client: UsersEntity,
//   ): OrdersEntity {
//     const orderEntity = new OrdersEntity();
//     orderEntity.orderId = uuid4();
//     orderEntity.totalPrice = totalPrice;
//     orderEntity.paymentSystem = paymentSystem;
//     orderEntity.createdAt = createdAt;
//     orderEntity.updatedAt = null;
//     orderEntity.client = client;
//     return orderEntity;
//   }
// }
