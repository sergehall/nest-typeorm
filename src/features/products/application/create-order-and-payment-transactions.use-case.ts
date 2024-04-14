import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentTransactionsEntity } from '../entities/payment-transaction.entity';
import { OrdersEntity } from '../entities/orders.entity';
import { OrderItemsEntity } from '../entities/order-items.entity';
import { PaymentsStatusEnum } from '../enums/payments-status.enum';
import { OrdersRepo } from '../infrastructure/orders.repo';
import { OrderItemsRepo } from '../infrastructure/order-items.repo';
import { ProductsDataEntity } from '../entities/products-data.entity';
import { GuestUsersEntity } from '../entities/unregistered-users.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { PaymentDto } from '../../../payment/dto/payment.dto';
import { PaymentTransactionsRepo } from '../../../payment/infrastructure/payment-transactions.repo';
import { PaymentSystem } from '../../../payment/enums/payment-system.enums';

export class CreateOrderAndPaymentTransactionsCommand {
  constructor(public paymentDto: PaymentDto[]) {}
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
    const { paymentDto } = command;
    try {
      const totalPrice: string = paymentDto
        .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
        .toString();
      const paymentSystem = paymentDto[0].paymentSystem;
      const createdAt = paymentDto[0].createdAt;
      const orderId = paymentDto[0].orderId;

      const currentClient = paymentDto[0].client;
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
        paymentDto,
        order,
      );
      await this.ordersRepo.saveOrdersEntity(order);

      // Store paymentTransaction, orderItem in the database
      await Promise.all([
        this.paymentTransactionsRepo.savePaymentTransactionsEntity(
          paymentTransactionEntity,
        ),
        this.orderItemsRepo.saveOrderItems(orderItemsEntities),
      ]);

      console.log('Order and payment transactions created successfully.');
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
    const paymentStatus = PaymentsStatusEnum.PENDING;

    return PaymentTransactionsEntity.createPaymentTransactionEntity(
      totalPrice,
      createdAt,
      order,
      paymentSystem,
      paymentStatus,
    );
  }

  private createOrderItemsEntities(
    paymentStripeDto: PaymentDto[],
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
