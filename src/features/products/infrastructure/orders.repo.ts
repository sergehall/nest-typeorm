import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersEntity } from '../entities/orders.entity';
import { OrderStatusEnum } from '../enums/order-status.enum';

@Injectable()
export class OrdersRepo {
  constructor(
    @InjectRepository(OrdersEntity)
    private readonly ordersRepository: Repository<OrdersEntity>,
  ) {}

  async completedPayment(
    orderId: string,
    clientId: string,
    updatedAt: string,
  ): Promise<boolean> {
    try {
      const order = await this.ordersRepository
        .createQueryBuilder('order')
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

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      order.orderStatus = OrderStatusEnum.COMPLETED;
      order.updatedAt = updatedAt;

      const updatedOrder = await this.ordersRepository.update(
        order.orderId,
        order,
      );

      return updatedOrder.affected === 1;
    } catch (error) {
      console.log('Error updatePaymentStatusAndUpdatedAt:', error);
      throw new InternalServerErrorException(
        'Error updatePaymentStatusAndUpdatedAt' + error.message,
      );
    }
  }

  async saveOrdersEntity(order: OrdersEntity): Promise<OrdersEntity> {
    try {
      return await this.ordersRepository.save(order);
    } catch (error) {
      console.log('Error saving order:', error);
      throw new InternalServerErrorException(
        'Error saving order' + error.message,
      );
    }
  }
}
