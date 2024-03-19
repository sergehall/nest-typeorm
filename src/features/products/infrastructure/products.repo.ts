import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsDataEntity } from '../entities/products-data.entity';
import { ProductRequest } from '../dto/products-request.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';

@Injectable()
export class ProductsRepo {
  constructor(
    @InjectRepository(ProductsDataEntity)
    private readonly productsRepository: Repository<ProductsDataEntity>,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  /**
   * Retrieves products from the database by their IDs and checks their availability.
   * @param products An array of ProductDto objects containing product IDs and quantities.
   * @returns Either an array of ProductsDataEntity objects if all products are available,
   *          or a string indicating products that are not available.
   */
  async getProductsByIds(
    products: ProductRequest[],
  ): Promise<string | ProductsDataEntity[]> {
    try {
      // Fetch product data for all product IDs concurrently
      const productPromises = products.map(async (product) => {
        const productData = await this.productsRepository.findOne({
          where: { productId: product.productId, isActive: true },
        });
        return { productData, product };
      });

      // Wait for all product data to be fetched
      const productResults = await Promise.all(productPromises);

      // Check for insufficient quantity and update stock quantity for valid products
      const updatedProducts: ProductsDataEntity[] = [];
      const notFoundProducts: string[] = [];

      for (const { productData, product } of productResults) {
        if (!productData) {
          notFoundProducts.push(product.productId);
        } else {
          if (productData.stockQuantity < product.quantity) {
            notFoundProducts.push(product.productId);
          } else {
            productData.stockQuantity -= product.quantity;
            updatedProducts.push(productData);
          }
        }
      }

      // If there are not found products, return error message
      if (notFoundProducts.length > 0) {
        return `Products with ID [ ${notFoundProducts.join(', ')} ] not found or do not have sufficient quantity`;
      }

      // If there are no updated products, return empty array
      if (updatedProducts.length === 0) {
        return [];
      }

      // Save updated product data
      await this.productsRepository.save(updatedProducts);

      return updatedProducts;
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const productId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(`Products with ID ${productId} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  // async getProductsByIds(
  //   products: ProductDto[],
  // ): Promise<string | ProductsDataEntity[]> {
  //   const productsDataEntity = [];
  //   const insufficientProducts: string[] = [];
  //
  //   try {
  //     for (const product of products) {
  //       const productData = await this.productsRepository.findOne({
  //         where: { id: product.productId },
  //       });
  //
  //       if (!productData) {
  //         return `Product with ID ${product.productId} not found`;
  //       }
  //
  //       if (productData.stockQuantity < product.quantity) {
  //         insufficientProducts.push(`${product.productId}`);
  //       } else {
  //         // Freeze the quantity
  //         productData.stockQuantity -= product.quantity;
  //         await this.productsRepository.save(productData);
  //         productsDataEntity.push(productData);
  //       }
  //     }
  //
  //     if (insufficientProducts.length > 0) {
  //       return (
  //         `Products with ID [ ` +
  //         insufficientProducts.join(', ') +
  //         ' ] do not have sufficient quantity'
  //       );
  //     }
  //
  //     return productsDataEntity;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async checkProductQuantities(
    products: ProductRequest[],
  ): Promise<string | null> {
    const insufficientProducts: string[] = [];

    try {
      for (const product of products) {
        const productData = await this.productsRepository.findOne({
          where: { productId: product.productId },
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
