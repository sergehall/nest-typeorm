import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentManager } from './payment-manager/payment-manager';
import { NodeEnvConfig } from '../config/node-env/node-env.config';
import { StripeConfig } from '../config/stripe/stripe.config';
import { PostgresConfig } from '../config/db/postgres/postgres.config';
import { ProductsDataEntity } from '../common/products/entities/products-data.entity';
import { StripeFactory } from '../config/stripe/stripe-factory';
import { StripeAdapter } from './payment-systems/stripe/adapter/stripe-adapter';
import { ProductsRepo } from '../common/products/infrastructure/products.repo';

const paymentConfigs = [NodeEnvConfig, StripeConfig, PostgresConfig];

@Module({
  imports: [TypeOrmModule.forFeature([ProductsDataEntity]), CqrsModule],
  controllers: [],
  providers: [
    ...paymentConfigs,
    StripeFactory,
    PaymentManager,
    StripeAdapter,
    ProductsRepo,
  ],
})
export class PaymentModule {}
