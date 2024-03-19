import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { OrdersEntity } from './orders.entity';
import { ProductsDataEntity } from './products-data.entity';
import * as uuid4 from 'uuid4';

@Entity('OrderItems')
export class OrderItemsEntity {
  @PrimaryColumn('uuid', { nullable: false })
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'character varying', nullable: false })
  createdAt: string;

  @Column({ type: 'character varying', nullable: true })
  updatedAt: string | null;

  @ManyToOne(() => ProductsDataEntity, (product) => product.items, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'productId' })
  product: ProductsDataEntity;

  @ManyToOne(() => OrdersEntity, (order) => order.items, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'orderId' })
  order: OrdersEntity;

  static createOrderItemEntity(
    quantity: number,
    product: ProductsDataEntity,
    order: OrdersEntity,
  ): OrderItemsEntity {
    const orderItemEntity = new OrderItemsEntity();
    orderItemEntity.id = uuid4();
    orderItemEntity.quantity = quantity;
    orderItemEntity.createdAt = new Date().toISOString();
    orderItemEntity.updatedAt = null;
    orderItemEntity.product = product;
    orderItemEntity.order = order;
    return orderItemEntity;
  }
}
