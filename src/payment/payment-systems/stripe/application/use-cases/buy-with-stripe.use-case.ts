import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ProductRequest,
  ProductsRequestDto,
} from '../../../../../common/products/dto/products-request.dto';
import { CurrentUserDto } from '../../../../../features/users/dto/current-user.dto';
import { PaymentManager } from '../../../../payment-manager/payment-manager';
import { StripeService } from '../stripe.service';
import { ProductsRepo } from '../../../../../common/products/infrastructure/products.repo';
import { PaymentSystem } from '../../../../enums/payment-system.enums';
import { ProductsDataEntity } from '../../../../../common/products/entities/products-data.entity';
import { NotFoundException } from '@nestjs/common';
import { PaymentStripeDto } from '../../dto/payment-stripe.dto';
import { CreateOrderAndPaymentTransactionsCommand } from '../../../../../common/products/application/create-order-and-payment-transactions.use-case';

export class BuyWithStripeCommand {
  constructor(
    public productsRequestDto: ProductsRequestDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(BuyWithStripeCommand)
export class BuyWithStripeUseCase
  implements ICommandHandler<BuyWithStripeCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentManager: PaymentManager,
    private readonly stripeService: StripeService,
    private readonly productsRepo: ProductsRepo,
  ) {}

  async execute(command: BuyWithStripeCommand): Promise<void> {
    const { productsRequestDto, currentUserDto } = command;

    const paymentSystem = PaymentSystem.STRIPE;

    const productsRequest: ProductRequest[] = productsRequestDto.products;

    const productsDataEntities: string | ProductsDataEntity[] =
      await this.productsRepo.getProductsByIds(productsRequest);

    if (typeof productsDataEntities === 'string') {
      throw new NotFoundException(productsDataEntities);
    }

    const paymentStripeDto: PaymentStripeDto[] =
      await this.stripeService.createPaymentStripeDto(
        productsRequest,
        productsDataEntities,
        paymentSystem,
        currentUserDto,
      );
    console.log(paymentStripeDto, 'paymentStripeDto');
    const orderAndPaymentTransactions = await this.commandBus.execute(
      new CreateOrderAndPaymentTransactionsCommand(paymentStripeDto),
    );
    console.log(orderAndPaymentTransactions, 'orderAndPaymentTransactions');
    // await this.paymentManager.processPayment(paymentStripeDto, paymentSystem);
  }
}

// export class BuyProductsCommand {
//   constructor(
//     public buyRequest: BuyRequestDto,
//     public paymentSystem: PaymentSystem,
//     public currentUserDto: CurrentUserDto | null,
//   ) {}
// }
//
// @CommandHandler(BuyProductsCommand)
// export class BuyProductsUseCase implements ICommandHandler<BuyProductsCommand> {
//   constructor(
//     private readonly paymentManager: PaymentManager,
//     private readonly productsRepo: ProductsRepo,
//   ) {}
//
//   /**
//    * Executes the command to buy products.
//    * @param command The BuyProductsCommand object.
//    * @returns Promise<void>
//    */
//   async execute(command: BuyProductsCommand): Promise<void> {
//     const { buyRequest, paymentSystem, currentUserDto } = command;
//
//     const products: ProductDto[] = buyRequest.products;
//
//     /**
//      * Return an array of order entries with additional information about each product.
//      * If any product is out of stock or not found, returns a string indicating the intersection
//      * of products that are out of stock.
//      */
//     const productsData: string | ProductsDataEntity[] =
//       await this.productsRepo.getProductsByIds(products);
//
//     if (productsData instanceof Array) {
//       const ordersDto: PaymentStripeDto[] = await this.paymentStripeDto(
//         products,
//         productsData,
//         paymentSystem,
//         currentUserDto,
//       );
//       console.log(ordersDto, 'ordersDto');
//
//       await this.paymentManager.processPayment(
//         ordersDto,
//         paymentSystem,
//         currentUserDto,
//       );
//
//       return;
//     }
//
//     throw new NotFoundException(productsData);
//   }
//
//   /**
//    * Creates orders for the products to be bought.
//    * @param products The products to be bought.
//    * @param productsData The data of products fetched from the repository.
//    * @param paymentSystem The payment system to be used.
//    * @param currentUserDto The current user's data.
//    * @returns Promise<PaymentStripeDto[]>
//    */
//   private async paymentStripeDto(
//     products: ProductDto[],
//     productsData: ProductsDataEntity[],
//     paymentSystem: PaymentSystem,
//     currentUserDto: CurrentUserDto | null,
//   ): Promise<PaymentStripeDto[]> {
//     return new Promise<PaymentStripeDto[]>((resolve, reject) => {
//       const orderArr: PaymentStripeDto[] = [];
//       const uuid: string = uuid4();
//
//       const clientId: string =
//         currentUserDto?.userId || 'test-clientReferenceId';
//
//       try {
//         for (const product of products) {
//           const productData: ProductsDataEntity | undefined = productsData.find(
//             (data) => data.productId === product.productId,
//           );
//
//           if (productData && product.quantity <= productData.stockQuantity) {
//             const totalPrice: string = (
//               product.quantity * Number(productData.unit_amount)
//             ).toFixed(2);
//             const order: PaymentStripeDto = {
//               orderId: uuid,
//               productId: product.productId,
//               name: productData.name,
//               description: productData.description,
//               currency: productData.currency,
//               quantity: product.quantity,
//               unit_amount: productData.unit_amount,
//               totalPrice: totalPrice,
//               clientId: clientId,
//               createdAt: new Date().toISOString(),
//               anyConfirmPaymentSystemData: paymentSystem,
//             };
//             orderArr.push(order);
//           } else {
//             console.log(
//               `Product with productId ${product.productId} is out of stock or not found.`,
//             );
//           }
//         }
//
//         if (orderArr.length === 0) {
//           reject(
//             new InternalServerErrorException('No valid orders were created.'),
//           );
//         } else {
//           resolve(orderArr);
//         }
//       } catch (error) {
//         reject(error); // Forwarding any unexpected errors
//       }
//     });
//   }
// }
