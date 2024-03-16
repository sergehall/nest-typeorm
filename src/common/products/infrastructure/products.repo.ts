import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsDataEntity } from '../entities/products-data.entity';

@Injectable()
export class ProductsRepo {
  constructor(
    @InjectRepository(ProductsDataEntity)
    private readonly productsRepository: Repository<ProductsDataEntity>,
  ) {}

  async saveTestArrProducts(
    products: ProductsDataEntity[],
  ): Promise<ProductsDataEntity[]> {
    try {
      return await this.productsRepository.save(products);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
