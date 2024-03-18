import { Module } from '@nestjs/common';
import { StripeController } from './api/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ProcessStripeWebHookUseCase } from './application/use-cases/process-stripe-webhook.use-case';
import { StripeAdapter } from './adapter/stripe-adapter';
import { BuyWithStripeUseCase } from './application/use-cases/buy-with-stripe.use-case';
import { StripeService } from './application/stripe.service';
import { ProductsDataEntity } from '../../../common/products/entities/products-data.entity';
import { StripeFactory } from '../../../config/stripe/stripe-factory';
import { NodeEnvConfig } from '../../../config/node-env/node-env.config';
import { PostgresConfig } from '../../../config/db/postgres/postgres.config';
import { StripeConfig } from '../../../config/stripe/stripe.config';
import { PaymentManager } from '../../payment-manager/payment-manager';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';
import { ProductsRepo } from '../../../common/products/infrastructure/products.repo';

const stripeUseCases = [BuyWithStripeUseCase, ProcessStripeWebHookUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([ProductsDataEntity]), CqrsModule],
  controllers: [StripeController],
  providers: [
    StripeFactory,
    NodeEnvConfig,
    PostgresConfig,
    StripeConfig,
    PaymentManager,
    StripeAdapter,
    StripeService,
    ParseQueriesService,
    ProductsRepo,
    ...stripeUseCases,
  ],
})
export class StripeModule {}
