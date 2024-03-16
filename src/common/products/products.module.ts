import { Module } from '@nestjs/common';
import { CreateRandomProductUseCase } from './application/create-random-products.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from './api/products.controller';
import { ProductsRepo } from './infrastructure/products.repo';
import { ProductsDataEntity } from './entities/products-data.entity';
import { ParseQueriesService } from '../query/parse-queries.service';
import { CreateAndSaveTestArrProductsUseCase } from './application/create-and-save-test-arr-products.use-case';

const useCases = [
  CreateRandomProductUseCase,
  CreateAndSaveTestArrProductsUseCase,
];
const services = [ParseQueriesService];

@Module({
  imports: [TypeOrmModule.forFeature([ProductsDataEntity]), CqrsModule],
  controllers: [ProductsController],
  providers: [ProductsRepo, ...useCases, ...services],
})
export class ProductsModule {}
