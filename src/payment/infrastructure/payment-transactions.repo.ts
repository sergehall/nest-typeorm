import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PaymentTransactionsEntity } from '../../features/products/entities/payment-transaction.entity';
import Stripe from 'stripe';
import { PaymentsStatusEnum } from '../../features/products/enums/payments-status.enum';
import { OrderStatusEnum } from '../../features/products/enums/order-status.enum';
import { OrdersEntity } from '../../features/products/entities/orders.entity';

@Injectable()
export class PaymentTransactionsRepo {
  constructor(
    @InjectRepository(PaymentTransactionsEntity)
    private readonly paymentTransactionsRepository: Repository<PaymentTransactionsEntity>,
    @InjectRepository(OrdersEntity)
    private readonly ordersRepository: Repository<OrdersEntity>,
  ) {}

  async completeOrderAndConfirmPayment(
    orderId: string,
    clientId: string,
    updatedAt: string,
    checkoutSessionCompletedObject: Stripe.Checkout.Session,
  ): Promise<boolean> {
    try {
      return await this.paymentTransactionsRepository.manager.transaction(
        async (transactionalEntityManager: EntityManager): Promise<boolean> => {
          const promises: Promise<boolean>[] = [
            this.updateOrderStatus(
              orderId,
              clientId,
              updatedAt,
              transactionalEntityManager,
            ),
            this.confirmPayment(
              orderId,
              updatedAt,
              checkoutSessionCompletedObject,
              transactionalEntityManager,
            ),
          ];
          const [orderUpdated, paymentConfirmed] = await Promise.all(promises);
          return orderUpdated && paymentConfirmed;
        },
      );
    } catch (error) {
      console.error('Error completing order and confirming payment:', error);
      throw new InternalServerErrorException(
        'Failed to complete order and confirm payment',
      );
    }
  }

  private async updateOrderStatus(
    orderId: string,
    clientId: string,
    updatedAt: string,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const order = await this.ordersRepository.manager
        .createQueryBuilder(OrdersEntity, 'order')
        .leftJoinAndSelect('order.client', 'client')
        .leftJoinAndSelect('order.guestClient', 'guestClient')
        .where('order.orderId = :orderId', { orderId })
        .andWhere('order.orderStatus = :orderStatus', {
          orderStatus: OrderStatusEnum.PENDING,
        })
        .andWhere(
          '(client.userId = :clientId OR guestClient.guestUserId = :clientId)',
          { clientId },
        )
        .getOne();

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      order.orderStatus = OrderStatusEnum.COMPLETED;
      order.updatedAt = updatedAt;

      await manager.save(order);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  private async confirmPayment(
    orderId: string,
    updatedAt: string,
    checkoutSessionCompletedObject: Stripe.Checkout.Session,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const paymentTransaction =
        await this.paymentTransactionsRepository.manager
          .createQueryBuilder(PaymentTransactionsEntity, 'paymentTransaction')
          .leftJoinAndSelect('paymentTransaction.order', 'order')
          .where('paymentTransaction.orderId = :orderId', { orderId })
          .andWhere('paymentTransaction.paymentStatus = :paymentStatus', {
            paymentStatus: PaymentsStatusEnum.PENDING,
          })
          .getOne();

      if (!paymentTransaction) {
        throw new NotFoundException(
          `Payment transaction with orderId ${orderId} not found`,
        );
      }

      paymentTransaction.paymentStatus = PaymentsStatusEnum.CONFIRMED;
      paymentTransaction.updatedAt = updatedAt;
      paymentTransaction.anyConfirmPaymentSystemData = JSON.stringify(
        checkoutSessionCompletedObject,
      );

      await manager.save(paymentTransaction);
      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new InternalServerErrorException('Failed to confirm payment');
    }
  }

  async savePaymentTransactionsEntity(
    paymentTransaction: PaymentTransactionsEntity,
  ): Promise<PaymentTransactionsEntity> {
    try {
      return await this.paymentTransactionsRepository.save(paymentTransaction);
    } catch (error) {
      console.log('Error saving payment transaction:', error);
      throw new InternalServerErrorException(
        'Error saving payment transaction' + error.message,
      );
    }
  }
}
