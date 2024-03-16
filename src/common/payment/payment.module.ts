import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentManager } from './payment-manager/payment-manager';

@Module({
  imports: [TypeOrmModule.forFeature([]), CqrsModule],
  controllers: [],
  providers: [PaymentManager],
})
export class PaymentModule {}
