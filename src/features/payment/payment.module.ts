import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentManager } from './payment-manager/payment-manager';
import { BuyProductsUseCase } from './application/use-cases/buy-products.use-case';
import { PaymentService } from './application/payment.service';
import { PayPalAdapter } from './payment-systems/pay-pal/adapter/pay-pal.adapter';
import { StripeAdapter } from './payment-systems/stripe/adapter/stripe-adapter';
import { NodeEnvConfig } from '../../config/node-env/node-env.config';
import { StripeConfig } from '../../config/stripe/stripe.config';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { UuidErrorResolver } from '../../common/helpers/uuid-error-resolver';
import { ProductsDataEntity } from '../products/entities/products-data.entity';
import { PayPalConfig } from '../../config/pay-pal/pay-pal.config';
import { PayPalFactory } from '../../config/pay-pal/pay-pal-factory';
import { StripeFactory } from '../../config/stripe/stripe-factory';
import { ProductsRepo } from '../products/infrastructure/products.repo';

const paymentUseCases = [BuyProductsUseCase];
const paymentConfigs = [NodeEnvConfig, StripeConfig, PostgresConfig];

const helpers = [UuidErrorResolver];

@Module({
  imports: [TypeOrmModule.forFeature([ProductsDataEntity]), CqrsModule],
  controllers: [],
  providers: [
    PaymentService,
    PayPalConfig,
    PayPalFactory,
    PayPalAdapter,
    StripeAdapter,
    StripeFactory,
    PaymentManager,
    ProductsRepo,
    ...helpers,
    ...paymentConfigs,
    ...paymentUseCases,
  ],
})
export class PaymentModule {}
