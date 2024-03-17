import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Currency } from '../../payment/enums/currency.enums';
import { ProductsDataEntity } from '../entities/products-data.entity';
import { TEST_DATA } from '../test-data/test-data';

export class CreateRandomProductCommand {
  constructor(public countProducts: number) {}
}

interface ProductData {
  name: string;
  description: string;
  unitAmount: number;
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
      name: this.getRandomItem(TEST_DATA.PRODUCT_NAMES),
      description: this.getRandomItem(TEST_DATA.PRODUCT_DESCRIPTIONS),
      unitAmount: this.getRandomNumber(100, 1000),
      currency: this.getRandomItem(TEST_DATA.CURRENCIES),
      stockQuantity: this.getRandomNumber(1, 10),
      manufacturer: this.getRandomItem(TEST_DATA.MANUFACTURERS),
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

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private async generateRandomString(): Promise<string> {
    const randomLetter = (): string =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const randomNumber = (): string => String(Math.floor(Math.random() * 10));
    return `${randomLetter()}${randomLetter()}${randomLetter()}-${randomNumber()}${randomNumber()}${randomNumber()}`;
  }
}
