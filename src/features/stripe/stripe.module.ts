import { Module } from '@nestjs/common';
import { StripeService } from './application/stripe.service';
import { StripeController } from './api/stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { StripeFactory } from '../../config/stripe/stripe-factory';

@Module({
  imports: [TypeOrmModule.forFeature([]), CqrsModule],
  controllers: [StripeController],
  providers: [StripeFactory, StripeService],
})
export class StripeModule {}
