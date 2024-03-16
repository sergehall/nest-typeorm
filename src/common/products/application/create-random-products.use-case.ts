import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Currency } from '../../payment/enums/currency.enums';
import { ProductsDataEntity } from '../entities/products-data.entity';

export class CreateRandomProductCommand {
  constructor(public countProducts: number) {}
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

    const manufacturerArr: string[] = [
      'Apple Inc.',
      'Microsoft Corporation',
      'Samsung Electronics Co., Ltd.',
      'Google LLC',
      'Intel Corporation',
      'HP Inc.',
      'Dell Technologies Inc.',
      'Lenovo Group Limited',
      'Sony Corporation',
      'ASUSTek Computer Inc.',
      'Acer Inc.',
      'IBM Corporation',
      'NVIDIA Corporation',
      'Advanced Micro Devices, Inc. (AMD)',
      'Cisco Systems, Inc.',
      'Oracle Corporation',
      'Logitech International S.A.',
      'Canon Inc.',
      'Seagate Technology PLC',
      'Western Digital Corporation',
      'Micron Technology, Inc.',
      'Qualcomm Incorporated',
      'Texas Instruments Incorporated',
      'Panasonic Corporation',
      'LG Electronics Inc.',
      'Toshiba Corporation',
      'Nokia Corporation',
      'Epson Corporation',
      'Xiaomi Corporation',
      'Uber Technologies, Inc.',
      'SpaceX',
    ];

    // Random currency values
    const currencies = [Currency.USD];

    // Function to generate a random number within a range
    const getRandomNumber = (min: number, max: number): number =>
      Math.floor(Math.random() * (max - min + 1) + min);

    // Function to create a random product
    const createRandomProduct = async (): Promise<ProductsDataEntity> => {
      const name = productNames[getRandomNumber(0, productNames.length - 1)];
      const description =
        productDescriptions[getRandomNumber(0, productDescriptions.length - 1)];
      const unit_amount = getRandomNumber(100, 1000); // Random price between $1.00 and $10.00
      const currency = currencies[getRandomNumber(0, currencies.length - 1)];
      const stockQuantity = getRandomNumber(1, 10); // Random stock quantity between 1 and 10
      const manufacturer =
        manufacturerArr[getRandomNumber(0, manufacturerArr.length - 1)];
      const model = await this.generateRandomString();

      return ProductsDataEntity.createProductDataEntity(
        name,
        description,
        unit_amount,
        currency,
        stockQuantity,
        manufacturer,
        model,
      );
    };

    // Create countProducts random products
    for (let i = 0; i < countProducts; i++) {
      productData.push(await createRandomProduct());
    }

    return productData;
  }

  private async generateRandomString(): Promise<string> {
    const randomLetter = (): string =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const randomNumber = (): string => String(Math.floor(Math.random() * 10));
    return `${randomLetter()}${randomLetter()}${randomLetter()}-${randomNumber()}${randomNumber()}${randomNumber()}`;
  }
}
