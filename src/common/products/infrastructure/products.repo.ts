import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsDataEntity } from '../entities/products-data.entity';
import { ProductDto } from '../../../features/blogs/dto/buy-request.dto';

@Injectable()
export class ProductsRepo {
  constructor(
    @InjectRepository(ProductsDataEntity)
    private readonly productsRepository: Repository<ProductsDataEntity>,
  ) {}

  async getProducts(ids: string[]): Promise<ProductsDataEntity[]> {
    try {
      // Retrieve products based on the provided IDs using QueryBuilder
      return await this.productsRepository
        .createQueryBuilder('product')
        .where('product.id IN (:...ids)', { ids })
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkProductQuantities(products: ProductDto[]): Promise<string | null> {
    const insufficientProducts: string[] = [];

    try {
      for (const product of products) {
        const productData = await this.productsRepository.findOne({
          where: { id: product.productId },
        });

        if (!productData) {
          return `Product with ID ${product.productId} not found`;
        }

        if (productData.stockQuantity < product.quantity) {
          insufficientProducts.push(`${product.productId}`);
        } else {
          // Freeze the quantity
          productData.stockQuantity -= product.quantity;
          await this.productsRepository.save(productData);
        }
      }

      if (insufficientProducts.length > 0) {
        return (
          `Products with ID [ ` +
          insufficientProducts.join(', ') +
          ' ] do not have sufficient quantity'
        );
      }

      return null; // All products have sufficient quantities
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

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
