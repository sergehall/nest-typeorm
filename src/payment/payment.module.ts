import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentManager } from './payment-manager/payment-manager';
import { NodeEnvConfig } from '../config/node-env/node-env.config';
import { StripeConfig } from '../config/stripe/stripe.config';
import { PostgresConfig } from '../config/db/postgres/postgres.config';
import { StripeFactory } from '../config/stripe/stripe-factory';
import { StripeAdapter } from './payment-systems/stripe/adapter/stripe-adapter';
import { ProductsDataEntity } from '../features/products/entities/products-data.entity';
import { ProductsRepo } from '../features/products/infrastructure/products.repo';
import { KeyResolver } from '../common/helpers/key-resolver';
import { UuidErrorResolver } from '../common/helpers/uuid-error-resolver';

const paymentConfigs = [NodeEnvConfig, StripeConfig, PostgresConfig];

const helpers = [UuidErrorResolver];

@Module({
  imports: [TypeOrmModule.forFeature([ProductsDataEntity]), CqrsModule],
  controllers: [],
  providers: [
    ...paymentConfigs,
    StripeFactory,
    PaymentManager,
    StripeAdapter,
    ProductsRepo,
    ...helpers,
  ],
})
export class PaymentModule {}
