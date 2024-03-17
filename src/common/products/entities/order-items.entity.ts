import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { OrdersEntity } from './orders.entity';

@Entity('OrderItems')
export class OrderItemsEntity {
  @PrimaryColumn('uuid', { nullable: false })
  id: string;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @ManyToOne(() => OrdersEntity, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: OrdersEntity;
}
