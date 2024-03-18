import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from './api/products.controller';
import { ProductsRepo } from './infrastructure/products.repo';
import { ProductsDataEntity } from './entities/products-data.entity';
import { ParseQueriesService } from '../query/parse-queries.service';
import { CreateAndSaveCreateRandomProductsUseCase } from './application/create-and-save-create-random-products.use-case';
import { CreateRandomProductsUseCase } from './application/create-random-products.use-case';
import { OrderItemsEntity } from './entities/order-items.entity';
import { PaymentTransactionsEntity } from './entities/payment-transaction.entity';
import { OrdersEntity } from './entities/orders.entity';
import { OrdersRepo } from './infrastructure/orders.repo';
import { PaymentTransactionsRepo } from './infrastructure/payment-transactions.repo';
import { OrderItemsRepo } from './infrastructure/order-items.repo';

const useCases = [
  CreateRandomProductsUseCase,
  CreateAndSaveCreateRandomProductsUseCase,
];
const services = [ParseQueriesService];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdersEntity,
      OrderItemsEntity,
      ProductsDataEntity,
      PaymentTransactionsEntity,
    ]),
    CqrsModule,
  ],
  controllers: [ProductsController],
  providers: [
    OrdersRepo,
    ProductsRepo,
    OrderItemsRepo,
    PaymentTransactionsRepo,
    ...useCases,
    ...services,
  ],
})
export class ProductsModule {}
