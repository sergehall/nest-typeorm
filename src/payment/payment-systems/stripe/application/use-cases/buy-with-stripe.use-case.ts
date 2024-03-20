// import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { CurrentUserDto } from '../../../../../features/users/dto/current-user.dto';
// import { PaymentManager } from '../../../../payment-manager/payment-manager';
// import { PaymentService } from '../../../../application/payment.service';
// import { PaymentSystem } from '../../../../enums/payment-system.enums';
// import { NotFoundException } from '@nestjs/common';
// import { PaymentDto } from '../../../../dto/payment.dto';
// import { GuestUsersDto } from '../../../../../features/users/dto/guest-users.dto';
// import { PaymentLinkDto } from '../../../../dto/payment-link.dto';
// import {
//   ProductRequest,
//   ProductsRequestDto,
// } from '../../../../../features/products/dto/products-request.dto';
// import { ProductsRepo } from '../../../../../features/products/infrastructure/products.repo';
// import { ProductsDataEntity } from '../../../../../features/products/entities/products-data.entity';
// import { CreateOrderAndPaymentTransactionsCommand } from '../../../../../features/products/application/create-order-and-payment-transactions.use-case';
//
// export class BuyWithStripeCommand {
//   constructor(
//     public productsRequestDto: ProductsRequestDto,
//     public currentUserDto: CurrentUserDto | GuestUsersDto,
//   ) {}
// }
//
// @CommandHandler(BuyWithStripeCommand)
// export class BuyWithStripeUseCase
//   implements ICommandHandler<BuyWithStripeCommand>
// {
//   constructor(
//     private readonly commandBus: CommandBus,
//     private readonly paymentManager: PaymentManager,
//     private readonly stripeService: PaymentService,
//     private readonly productsRepo: ProductsRepo,
//   ) {}
//
//   async execute(command: BuyWithStripeCommand): Promise<PaymentLinkDto | null> {
//     const { productsRequestDto, currentUserDto } = command;
//
//     const paymentSystem = PaymentSystem.STRIPE;
//
//     const productsRequest: ProductRequest[] = productsRequestDto.products;
//
//     const productsDataEntities: string | ProductsDataEntity[] =
//       await this.productsRepo.getProductsByIds(productsRequest);
//
//     if (typeof productsDataEntities === 'string') {
//       throw new NotFoundException(productsDataEntities);
//     }
//
//     const paymentStripeDto: PaymentDto[] =
//       await this.stripeService.createPaymentStripeDto(
//         productsRequest,
//         productsDataEntities,
//         paymentSystem,
//         currentUserDto,
//       );
//
//     await this.commandBus.execute(
//       new CreateOrderAndPaymentTransactionsCommand(paymentStripeDto),
//     );
//
//     return await this.paymentManager.processPayment(
//       paymentStripeDto,
//       paymentSystem,
//     );
//   }
// }
