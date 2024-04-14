import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import * as uuid4 from 'uuid4';
import { OrderItemsEntity } from './order-items.entity';
import { Currency } from '../../../payment/enums/currency.enums';

@Entity('ProductsData')
export class ProductsDataEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  productId: string;

  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'character varying', nullable: false })
  model: string;

  @Column({ type: 'character varying', nullable: false })
  description: string;

  @Column({ type: 'character varying', nullable: false })
  manufacturer: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitAmount: string;

  @Column({ type: 'character varying', nullable: true })
  pathKeyImageUrl: string | null;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD,
    nullable: false,
  })
  currency: Currency;

  @Column({ nullable: false, default: true })
  isActive: boolean;

  @Column({ nullable: false, default: 0 })
  stockQuantity: number;

  @Column({ type: 'character varying', nullable: false })
  createdAt: string;

  @Column({ type: 'character varying', nullable: true })
  updatedAt: string | null;

  @OneToMany(() => OrderItemsEntity, (item) => item.product)
  items: OrderItemsEntity[];

  static createProductDataEntity(
    name: string,
    description: string,
    unitAmount: string,
    currency: Currency,
    stockQuantity: number,
    manufacturer: string,
    model: string,
  ): ProductsDataEntity {
    const productDataEntity = new ProductsDataEntity();
    productDataEntity.productId = uuid4();
    productDataEntity.name = name;
    productDataEntity.description = description;
    productDataEntity.model = model;
    productDataEntity.unitAmount = unitAmount;
    productDataEntity.currency = currency;
    productDataEntity.isActive = true; // Set as active by default
    productDataEntity.pathKeyImageUrl = null; // Default to null
    productDataEntity.stockQuantity = stockQuantity; // Default stock quantity 0
    productDataEntity.manufacturer = manufacturer; // Default to null
    productDataEntity.createdAt = new Date().toISOString();
    productDataEntity.updatedAt = null; // Default to null
    return productDataEntity;
  }
}
