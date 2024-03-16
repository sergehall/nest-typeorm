import { Module } from '@nestjs/common';
import { StripeService } from './application/stripe.service';
import { StripeController } from './api/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { StripeFactory } from '../../config/stripe/stripe-factory';
import { PostgresConfig } from '../../config/db/postgres/postgres.config';
import { BuyProductsUseCase } from './application/use-cases/buy-products.use-case';
import { StripeConfig } from '../../config/stripe/stripe.config';
import { ProcessStripeWebHookUseCase } from './application/use-cases/process-stripe-webhook.use-case';
import { NodeEnvConfig } from '../../config/node-env/node-env.config';

const stripeUseCases = [BuyProductsUseCase, ProcessStripeWebHookUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([]), CqrsModule],
  controllers: [StripeController],
  providers: [
    StripeFactory,
    NodeEnvConfig,
    PostgresConfig,
    StripeConfig,
    StripeService,
    ...stripeUseCases,
  ],
})
export class StripeModule {}
