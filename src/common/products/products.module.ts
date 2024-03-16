import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from './api/products.controller';
import { ProductsRepo } from './infrastructure/products.repo';
import { ProductsDataEntity } from './entities/products-data.entity';
import { ParseQueriesService } from '../query/parse-queries.service';
import { CreateAndSaveCreateRandomProductsUseCase } from './application/create-and-save-create-random-products.use-case';
import { CreateRandomProductsUseCase } from './application/create-random-products.use-case';

const useCases = [
  CreateRandomProductsUseCase,
  CreateAndSaveCreateRandomProductsUseCase,
];
const services = [ParseQueriesService];

@Module({
  imports: [TypeOrmModule.forFeature([ProductsDataEntity]), CqrsModule],
  controllers: [ProductsController],
  providers: [ProductsRepo, ...useCases, ...services],
})
export class ProductsModule {}
