import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import Stripe from 'stripe';
import { PayPalEventType } from '../payment-systems/pay-pal/types/pay-pal-event.type';
import { PayPalCompletedEventType } from '../payment-systems/pay-pal/types/pay-pal-completed-event.type';
import { PaymentTransactionsEntity } from '../../features/products/entities/payment-transaction.entity';
import { OrdersEntity } from '../../features/products/entities/orders.entity';
import { PaymentsStatusEnum } from '../../features/products/enums/payments-status.enum';
import { OrderStatusEnum } from '../../features/products/enums/order-status.enum';

@Injectable()
export class PaymentTransactionsRepo {
  constructor(
    @InjectRepository(PaymentTransactionsEntity)
    private readonly paymentTransactionsRepository: Repository<PaymentTransactionsEntity>,
    @InjectRepository(OrdersEntity)
    private readonly ordersRepository: Repository<OrdersEntity>,
  ) {}

  async completedPayment(
    orderId: string,
    paymentData: PayPalCompletedEventType,
  ): Promise<void> {
    const updatedAt = new Date().toISOString();
    try {
      const paymentTransaction: PaymentTransactionsEntity | null =
        await this.paymentTransactionsRepository.findOne({
          where: { paymentProviderOrderId: orderId },
        });

      if (paymentTransaction) {
        // Convert paymentData to JSON string
        let updatedData: string = JSON.stringify(paymentData);

        if (paymentTransaction.paymentProviderInfoJson) {
          updatedData =
            paymentTransaction.paymentProviderInfoJson + ', ' + updatedData;
        }

        paymentTransaction.paymentStatus = PaymentsStatusEnum.COMPLETED;
        paymentTransaction.updatedAt = updatedAt;
        paymentTransaction.paymentProviderInfoJson = updatedData;

        await this.paymentTransactionsRepository.save(paymentTransaction);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new InternalServerErrorException('Failed to update payment status');
    }
  }

  async updateOrderAndPayment(
    orderId: string,
    clientId: string,
    updatedAt: string,
    paymentData: Stripe.Checkout.Session | PayPalEventType,
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
            this.paymentConfirm(
              orderId,
              updatedAt,
              paymentData,
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

  async updateOrderAndPaymentApproved(
    orderId: string,
    clientId: string,
    id: string,
    paymentData: Stripe.Checkout.Session | PayPalEventType,
  ): Promise<boolean> {
    try {
      const paymentOrderId = id;
      const updatedAt = new Date().toISOString();
      const statusOrder = OrderStatusEnum.AWAITING_SHIPMENT;

      return await this.paymentTransactionsRepository.manager.transaction(
        async (transactionalEntityManager: EntityManager): Promise<boolean> => {
          const promises: Promise<boolean>[] = [
            this.updateOrderStatusAwaitingShipment(
              orderId,
              clientId,
              updatedAt,
              statusOrder,
              transactionalEntityManager,
            ),
            this.paymentApproved(
              orderId,
              updatedAt,
              paymentOrderId,
              paymentData,
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

  private async updateOrderStatusAwaitingShipment(
    orderId: string,
    clientId: string,
    updatedAt: string,
    status: OrderStatusEnum,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const order = await this.findOrder(orderId, clientId);

      if (!order) {
        console.log(`Order with ID ${orderId} not found`);
        return false;
      }

      order.orderStatus = status;
      order.updatedAt = updatedAt;

      await manager.save(order);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  private async paymentApproved(
    orderId: string,
    updatedAt: string,
    paymentOrderId: string,
    paymentData: Stripe.Checkout.Session | PayPalEventType,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const paymentTransaction = await this.findPaymentTransaction(orderId);

      if (!paymentTransaction) {
        console.log(`Payment transaction with orderId ${orderId} not found`);
        return false;
      }

      let updatedData: string = JSON.stringify(paymentData); // Initialize updatedData with the new JSON data

      if (paymentTransaction.paymentProviderInfoJson) {
        updatedData =
          paymentTransaction.paymentProviderInfoJson + ', ' + updatedData;
      }

      paymentTransaction.paymentStatus = PaymentsStatusEnum.APPROVED;
      paymentTransaction.updatedAt = updatedAt;
      paymentTransaction.paymentProviderOrderId = paymentOrderId;
      paymentTransaction.paymentProviderInfoJson = updatedData;

      await manager.save(paymentTransaction);
      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new InternalServerErrorException('Failed to confirm payment');
    }
  }

  private async updateOrderStatus(
    orderId: string,
    clientId: string,
    updatedAt: string,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const order = await this.findOrder(orderId, clientId);

      if (!order) {
        console.log(`Order with ID ${orderId} not found`);
        return false;
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

  private async findOrder(
    orderId: string,
    clientId: string,
  ): Promise<OrdersEntity | null> {
    return await this.ordersRepository.manager
      .createQueryBuilder(OrdersEntity, 'order')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.guestClient', 'guestClient')
      .where('order.orderId = :orderId', { orderId })
      .andWhere('order.orderStatus = :orderStatus', {
        orderStatus: OrderStatusEnum.PROCESSING,
      })
      .andWhere(
        '(client.userId = :clientId OR guestClient.guestUserId = :clientId)',
        { clientId },
      )
      .getOne();
  }

  private async paymentConfirm(
    orderId: string,
    updatedAt: string,
    paymentData: Stripe.Checkout.Session | PayPalEventType,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const paymentTransaction = await this.findPaymentTransaction(orderId);

      if (!paymentTransaction) {
        console.log(`Payment transaction with orderId ${orderId} not found`);
        return false;
      }

      // Convert paymentData to JSON string
      let updatedData: string = JSON.stringify(paymentData);

      if (paymentTransaction.paymentProviderInfoJson) {
        updatedData =
          paymentTransaction.paymentProviderInfoJson + ', ' + updatedData;
      }

      // Update paymentTransaction properties
      paymentTransaction.paymentProviderInfoJson = updatedData;
      paymentTransaction.paymentStatus = PaymentsStatusEnum.COMPLETED;
      paymentTransaction.updatedAt = updatedAt;

      // Save the updated paymentTransaction
      await manager.save(paymentTransaction);

      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new InternalServerErrorException('Failed to confirm payment');
    }
  }

  private async findPaymentTransaction(
    orderId: string,
  ): Promise<PaymentTransactionsEntity | null> {
    return await this.paymentTransactionsRepository.manager
      .createQueryBuilder(PaymentTransactionsEntity, 'paymentTransaction')
      .leftJoinAndSelect('paymentTransaction.order', 'order')
      .where('paymentTransaction.orderId = :orderId', { orderId })
      .andWhere('paymentTransaction.paymentStatus = :paymentStatus', {
        paymentStatus: PaymentsStatusEnum.PENDING,
      })
      .getOne();
  }

  async savePaymentTransactionsEntity(
    paymentTransactionsEntity: PaymentTransactionsEntity,
  ): Promise<PaymentTransactionsEntity> {
    try {
      return await this.paymentTransactionsRepository.save(
        paymentTransactionsEntity,
      );
    } catch (error) {
      console.log('Error saving payment transaction:', error);
      throw new InternalServerErrorException(
        'Error saving payment transaction' + error.message,
      );
    }
  }
}
