import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemsEntity } from '../entities/order-items.entity';

@Injectable()
export class OrderItemsRepo {
  constructor(
    @InjectRepository(OrderItemsEntity)
    private readonly orderItemsRepository: Repository<OrderItemsEntity>,
  ) {}

  async saveOrderItems(
    orderItems: OrderItemsEntity[],
  ): Promise<OrderItemsEntity[]> {
    try {
      return await this.orderItemsRepository.save(orderItems);
    } catch (error) {
      console.log('Error saving orderItems:', error);
      throw new InternalServerErrorException(
        'Error saving orderItems' + error.message,
      );
    }
  }
}
