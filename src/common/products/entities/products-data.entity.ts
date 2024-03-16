import { Entity, Column, PrimaryColumn } from 'typeorm';
import * as uuid4 from 'uuid4';
import { Currency } from '../../payment/enums/currency.enums';

@Entity('ProductsData')
export class ProductsDataEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  id: string;

  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'character varying', nullable: false })
  model: string;

  @Column({ type: 'character varying', nullable: false })
  description: string;

  @Column({ type: 'character varying', nullable: false })
  manufacturer: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  unit_amount: number;

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

  static createProductDataEntity(
    name: string,
    description: string,
    unit_amount: number,
    currency: Currency,
    stockQuantity: number,
    manufacturer: string,
    model: string,
  ): ProductsDataEntity {
    const productDataEntity = new ProductsDataEntity();
    productDataEntity.id = uuid4();
    productDataEntity.name = name;
    productDataEntity.description = description;
    productDataEntity.model = model;
    productDataEntity.unit_amount = unit_amount;
    productDataEntity.currency = currency;
    productDataEntity.isActive = true; // Set as active by default
    productDataEntity.pathKeyImageUrl = null; // Default to null
    productDataEntity.stockQuantity = stockQuantity; // Default stock quantity 0
    productDataEntity.manufacturer = manufacturer; // Default to null
    productDataEntity.createdAt = new Date().toISOString();
    return productDataEntity;
  }
}
