import { Module } from '@nestjs/common';
import { StripeController } from './api/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { StripeFactory } from '../../config/stripe/stripe-factory';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { BuyProductsUseCase } from './application/use-cases/buy-products.use-case';
import { StripeConfig } from '../../config/stripe/stripe.config';
import { ProcessStripeWebHookUseCase } from './application/use-cases/process-stripe-webhook.use-case';
import { NodeEnvConfig } from '../../config/node-env/node-env.config';
import { StripeAdapter } from './adapter/stripe-adapter';

const stripeUseCases = [BuyProductsUseCase, ProcessStripeWebHookUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([]), CqrsModule],
  controllers: [StripeController],
  providers: [
    StripeFactory,
    NodeEnvConfig,
    PostgresConfig,
    StripeConfig,
    StripeAdapter,
    ...stripeUseCases,
  ],
})
export class StripeModule {}
