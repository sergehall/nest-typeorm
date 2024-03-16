import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Currency } from '../../payment/enums/currency.enums';
import { ProductsDataEntity } from '../entities/products-data.entity';

export class CreateRandomProductCommand {
  constructor(public countProducts: number) {}
}

@Injectable()
@CommandHandler(CreateRandomProductCommand)
export class CreateRandomProductUseCase
  implements ICommandHandler<CreateRandomProductCommand>
{
  constructor() {}

  async execute(
    command: CreateRandomProductCommand,
  ): Promise<ProductsDataEntity[]> {
    const { countProducts } = command;

    if (countProducts < 1 || countProducts > 100) {
      throw new InternalServerErrorException(
        'countProducts must be greater than 0 or max 100',
      );
    }

    const productData: ProductsDataEntity[] = [];

    // Random product names
    const productNames = [
      'Laptop',
      'Smartphone',
      'Headphones',
      'Camera',
      'Watch',
      'Tablet',
      'Speaker',
      'Keyboard',
      'Mouse',
      'Monitor',
      'Printer',
      'Router',
      'External Hard Drive',
      'USB Flash Drive',
      'Game Console',
      'Fitness Tracker',
      'Drone',
      'Smart Home Device',
      'Earbuds',
      'Power Bank',
    ];

    // Random product descriptions
    const productDescriptions = [
      'High-quality',
      'Durable',
      'Wireless',
      'Bluetooth-enabled',
      'Portable',
      'Waterproof',
      'Noise-cancelling',
      'Compact',
      'Energy-efficient',
      'Versatile',
    ];

    // Random currency values
    const currencies = [Currency.USD];

    // Function to generate a random number within a range
    function getRandomNumber(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Function to create a random product
    function createRandomProduct(): ProductsDataEntity {
      const name = productNames[getRandomNumber(0, productNames.length - 1)];
      const description = `${productDescriptions[getRandomNumber(0, productDescriptions.length - 1)]} ${name}`;
      const unit_amount = getRandomNumber(100, 1000); // Random price between $1.00 and $10.00
      const currency = currencies[getRandomNumber(0, currencies.length - 1)];
      const stockQuantity = getRandomNumber(1, 10); // Random stock quantity between 1 and 10

      return ProductsDataEntity.createProductDataEntity(
        name,
        description,
        unit_amount,
        currency,
        stockQuantity,
      );
    }

    // Create countProducts random products
    for (let i = 0; i < countProducts; i++) {
      productData.push(createRandomProduct());
    }

    return productData;
  }
}
