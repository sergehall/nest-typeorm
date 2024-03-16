import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentManager } from './payment-manager/payment-manager';
import { StripeAdapter } from '../../features/stripe/adapter/stripe-adapter';
import { StripeFactory } from '../../config/stripe/stripe-factory';
import { NodeEnvConfig } from '../../config/node-env/node-env.config';
import { StripeConfig } from '../../config/stripe/stripe.config';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { ProductsRepo } from '../products/infrastructure/products.repo';
import { ProductsDataEntity } from '../products/entities/products-data.entity';

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
