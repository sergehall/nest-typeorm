import { PaymentSystem } from '../../enums/payment-system.enums';
import {
  ProductRequest,
  ProductsRequestDto,
} from '../../../features/products/dto/products-request.dto';
import { CurrentUserDto } from '../../../features/users/dto/current-user.dto';
import { GuestUsersDto } from '../../../features/users/dto/guest-users.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentLinkDto } from '../../dto/payment-link.dto';
import { PaymentManager } from '../../payment-manager/payment-manager';
import { ProductsRepo } from '../../../features/products/infrastructure/products.repo';
import { ProductsDataEntity } from '../../../features/products/entities/products-data.entity';
import { NotFoundException } from '@nestjs/common';
import { PaymentDto } from '../../dto/payment.dto';
import { CreateOrderAndPaymentTransactionsCommand } from '../../../features/products/application/create-order-and-payment-transactions.use-case';
import { PaymentService } from '../payment.service';

export class BuyProductsCommand {
  constructor(
    public paymentSystem: PaymentSystem,
    public productsRequestDto: ProductsRequestDto,
    public currentUserDto: CurrentUserDto | GuestUsersDto,
  ) {}
}

@CommandHandler(BuyProductsCommand)
export class BuyProductsUseCase implements ICommandHandler<BuyProductsCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentManager: PaymentManager,
    private readonly paymentService: PaymentService,
    private readonly productsRepo: ProductsRepo,
  ) {}

  async execute(command: BuyProductsCommand): Promise<PaymentLinkDto | null> {
    const { paymentSystem, productsRequestDto, currentUserDto } = command;

    const productsRequest: ProductRequest[] = productsRequestDto.products;

    const productsDataEntities: string | ProductsDataEntity[] =
      await this.productsRepo.getProductsByIds(productsRequest);

    if (typeof productsDataEntities === 'string') {
      throw new NotFoundException(productsDataEntities);
    }

    const paymentStripeDto: PaymentDto[] =
      await this.paymentService.createPaymentStripeDto(
        productsRequest,
        productsDataEntities,
        paymentSystem,
        currentUserDto,
      );

    await this.commandBus.execute(
      new CreateOrderAndPaymentTransactionsCommand(paymentStripeDto),
    );

    return await this.paymentManager.processPayment(
      paymentStripeDto,
      paymentSystem,
    );
  }
}
