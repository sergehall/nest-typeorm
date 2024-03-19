import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PaymentStripeDto } from '../../../payment/payment-systems/stripe/dto/payment-stripe.dto';
import { PaymentTransactionsEntity } from '../entities/payment-transaction.entity';
import { OrdersEntity } from '../entities/orders.entity';
import { OrderItemsEntity } from '../entities/order-items.entity';
import { PaymentTransactionsRepo } from '../../../payment/infrastructure/payment-transactions.repo';
import { PaymentsStatusEnum } from '../enums/payments-status.enum';
import { PaymentSystem } from '../../../payment/enums/payment-system.enums';
import { OrdersRepo } from '../infrastructure/orders.repo';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { OrderItemsRepo } from '../infrastructure/order-items.repo';
import { ProductsDataEntity } from '../entities/products-data.entity';
import { CurrentUserDto } from '../../../features/users/dto/current-user.dto';
import { GuestUsersEntity } from '../entities/unregistered-users.entity';
import { InternalServerErrorException } from '@nestjs/common';

export class CreateOrderAndPaymentTransactionsCommand {
  constructor(public paymentStripeDto: PaymentStripeDto[]) {}
}

@CommandHandler(CreateOrderAndPaymentTransactionsCommand)
export class CreateOrderAndPaymentTransactionsUseCase
  implements ICommandHandler<CreateOrderAndPaymentTransactionsCommand>
{
  constructor(
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
    private readonly ordersRepo: OrdersRepo,
    private readonly orderItemsRepo: OrderItemsRepo,
  ) {}

  async execute(
    command: CreateOrderAndPaymentTransactionsCommand,
  ): Promise<void> {
    const { paymentStripeDto } = command;
    try {
      const totalPrice: string = paymentStripeDto
        .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
        .toString();
      const paymentSystem = paymentStripeDto[0].paymentSystem;
      const createdAt = paymentStripeDto[0].createdAt;
      const orderId = paymentStripeDto[0].orderId;

      const currentClient = paymentStripeDto[0].client;
      let client: UsersEntity | null = null;
      let guestClient: GuestUsersEntity | null = null;
      if (currentClient instanceof UsersEntity) {
        client = currentClient;
      } else if (currentClient instanceof GuestUsersEntity) {
        guestClient = currentClient;
      }

      // Create order entity
      const order = new OrdersEntity();
      order.orderId = orderId;
      order.totalPrice = totalPrice;
      order.createdAt = createdAt;
      order.client = client;
      order.guestClient = guestClient;
      order.paymentSystem = paymentSystem;

      // Create payment transaction entity
      const paymentTransactionEntity = this.createPaymentTransactionEntity(
        totalPrice,
        createdAt,
        order,
        paymentSystem,
      );

      // Create order items entities
      const orderItemsEntities = this.createOrderItemsEntities(
        paymentStripeDto,
        order,
      );
      await this.ordersRepo.save(order);

      // Store paymentTransaction, orderItem in the database
      await Promise.all([
        this.paymentTransactionsRepo.save(paymentTransactionEntity),
        this.orderItemsRepo.save(orderItemsEntities),
      ]);

      console.log('Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      // Handle error appropriately
    }
  }

  private createPaymentTransactionEntity(
    totalPrice: string,
    createdAt: string,
    order: OrdersEntity,
    paymentSystem: PaymentSystem,
  ): PaymentTransactionsEntity {
    const status = PaymentsStatusEnum.PENDING;

    return PaymentTransactionsEntity.createPaymentTransactionEntity(
      totalPrice,
      createdAt,
      order,
      paymentSystem,
      status,
    );
  }

  private createOrderItemsEntities(
    paymentStripeDto: PaymentStripeDto[],
    order: OrdersEntity,
  ): OrderItemsEntity[] {
    const orderItemsEntities: OrderItemsEntity[] = [];
    for (const product of paymentStripeDto) {
      const productsData: ProductsDataEntity = new ProductsDataEntity();
      productsData.productId = product.productId;

      orderItemsEntities.push(
        OrderItemsEntity.createOrderItemEntity(
          product.quantity,
          productsData,
          order,
        ),
      );
    }

    return orderItemsEntities;
  }
}
