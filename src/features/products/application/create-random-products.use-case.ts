import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ProductsDataEntity } from '../entities/products-data.entity';
import { TEST_DATA } from '../test-data/test-data';
import { Currency } from '../../../payment/enums/currency.enums';

export class CreateRandomProductCommand {
  constructor(public countProducts: number) {}
}

interface ProductData {
  name: string;
  description: string;
  unitAmount: string;
  currency: Currency;
  stockQuantity: number;
  manufacturer: string;
  model: string;
}

@Injectable()
@CommandHandler(CreateRandomProductCommand)
export class CreateRandomProductsUseCase
  implements ICommandHandler<CreateRandomProductCommand>
{
  constructor() {}

  async execute(
    command: CreateRandomProductCommand,
  ): Promise<ProductsDataEntity[]> {
    const { countProducts } = command;

    if (countProducts < 1 || countProducts > 100) {
      throw new RangeError('countProducts must be between 1 and 100');
    }

    const productData: ProductsDataEntity[] = [];

    for (let i = 0; i < countProducts; i++) {
      productData.push(await this.createRandomProduct());
    }

    return productData;
  }

  private async createRandomProduct(): Promise<ProductsDataEntity> {
    const productData: ProductData = {
      name: await this.getRandomItem(TEST_DATA.PRODUCT_NAMES),
      description: await this.getRandomItem(TEST_DATA.PRODUCT_DESCRIPTIONS),
      unitAmount: await this.getRandomPrice(100, 1000),
      currency: await this.getRandomItem(TEST_DATA.CURRENCIES),
      stockQuantity: await this.getRandomNumber(1, 10),
      manufacturer: await this.getRandomItem(TEST_DATA.MANUFACTURERS),
      model: await this.generateRandomString(),
    };

    return ProductsDataEntity.createProductDataEntity(
      productData.name,
      productData.description,
      productData.unitAmount,
      productData.currency,
      productData.stockQuantity,
      productData.manufacturer,
      productData.model,
    );
  }

  private async getRandomItem<T>(array: T[]): Promise<T> {
    return array[Math.floor(Math.random() * array.length)];
  }

  private async getRandomNumber(min: number, max: number): Promise<number> {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private async getRandomPrice(min: number, max: number): Promise<string> {
    const price = (Math.random() * (max - min) + min).toFixed(2); // Generate a random price with two decimal places
    const [dollars, cents] = price.split('.'); // Split into dollars and cents

    return `${dollars}.${cents}`; // Concatenate dollars and cents with a dot
  }

  private async generateRandomString(): Promise<string> {
    const randomLetter = (): string =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const randomNumber = (): string => String(Math.floor(Math.random() * 10));
    return `${randomLetter()}${randomLetter()}${randomLetter()}-${randomNumber()}${randomNumber()}${randomNumber()}`;
  }
}
