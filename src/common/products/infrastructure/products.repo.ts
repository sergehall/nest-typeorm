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
      const savedProductsPromises = products.map(async (product) => {
        const existingProduct = await this.productsRepository.findOne({
          where: {
            name: product.name,
            model: product.model,
          },
        });

        if (existingProduct) {
          // Product with the same name already exists, generate a new name
          product.name = await this.generateNewProductName(product.name);
        }

        return this.productsRepository.save(product);
      });

      return await Promise.all(savedProductsPromises);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async generateNewProductName(existingName: string): Promise<string> {
    const randomNumber = (): string => String(Math.floor(Math.random() * 10));
    const randomDigits = `${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}`;
    return `${existingName}_${randomDigits}`;
  }
}
