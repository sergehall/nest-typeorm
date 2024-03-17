import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BuyRequestDto, ProductDto } from '../../../blogs/dto/buy-request.dto';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentManager } from '../../../../common/payment/payment-manager/payment-manager';
import { PaymentSystem } from '../../../../common/payment/enums/payment-system.enums';
import { ProductsRepo } from '../../../../common/products/infrastructure/products.repo';
import { ProductsDataEntity } from '../../../../common/products/entities/products-data.entity';
import { OrderDto } from '../../../../common/products/dto/order.dto';
import * as uuid4 from 'uuid4';

export class BuyProductsCommand {
  constructor(
    public buyRequest: BuyRequestDto,
    public paymentSystem: PaymentSystem,
    public currentUserDto: CurrentUserDto | null,
  ) {}
}

@CommandHandler(BuyProductsCommand)
export class BuyProductsUseCase implements ICommandHandler<BuyProductsCommand> {
  constructor(
    private readonly paymentManager: PaymentManager,
    private readonly productsRepo: ProductsRepo,
  ) {}

  async execute(command: BuyProductsCommand): Promise<void> {
    const { buyRequest, paymentSystem, currentUserDto } = command;

    const products: ProductDto[] = buyRequest.products;
    console.log('products', products);
    const productsData: string | ProductsDataEntity[] =
      await this.productsRepo.getProductsByIds(products);
    console.log('productsData', productsData);

    // await this.verifiedQuantities(products);

    // await this.paymentManager.processPayment(
    //   products,
    //   paymentSystem,
    //   currentUserDto,
    // );
    // return;
    if (productsData instanceof Array) {
      const ordersDto = await this.createOrder(
        products,
        productsData,
        paymentSystem,
        currentUserDto,
      );
      console.log('ordersDto', ordersDto);

      // await this.paymentManager.processPayment(
      //   productsData,
      //   paymentSystem,
      //   currentUserDto,
      // );

      return;
    }

    throw new NotFoundException(productsData);
  }

  private async createOrder(
    products: ProductDto[],
    productsData: ProductsDataEntity[],
    paymentSystem: PaymentSystem,
    currentUserDto: CurrentUserDto | null,
  ): Promise<OrderDto[]> {
    return new Promise<OrderDto[]>((resolve, reject) => {
      const orderArr: OrderDto[] = [];
      const uuid: string = uuid4();

      const clientId: string =
        currentUserDto?.userId || 'test-clientReferenceId';

      try {
        for (const product of products) {
          const productData: ProductsDataEntity | undefined = productsData.find(
            (data) => data.productId === product.productId,
          );

          if (productData && product.quantity <= productData.stockQuantity) {
            const totalPrice: string = (
              product.quantity * Number(productData.unit_amount)
            ).toFixed(2);
            const order: OrderDto = {
              orderId: uuid,
              productId: product.productId,
              name: productData.name,
              description: productData.description,
              currency: productData.currency,
              quantity: product.quantity,
              totalPrice: totalPrice,
              clientId: clientId,
              createdAt: new Date().toISOString(),
              anyConfirmPaymentSystemData: paymentSystem,
            };
            orderArr.push(order);
          } else {
            console.log(
              `Product with productId ${product.productId} is out of stock or not found.`,
            );
          }
        }

        if (orderArr.length === 0) {
          reject(
            new InternalServerErrorException('No valid orders were created.'),
          );
        } else {
          resolve(orderArr);
        }
      } catch (error) {
        reject(error); // Forwarding any unexpected errors
      }
    });
  }

  // private async verifiedQuantities(productDto: ProductDto[]): Promise<void> {
  //   const insufficientProductsMessage: string | null =
  //     await this.productsRepo.checkProductQuantities(productDto);
  //
  //   if (insufficientProductsMessage) {
  //     throw new BadRequestException({
  //       message: {
  //         message: insufficientProductsMessage,
  //         field: 'quantity',
  //       },
  //     });
  //   }
  // }
}
