import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersEntity } from '../entities/orders.entity';

@Injectable()
export class OrdersRepo {
  constructor(
    @InjectRepository(OrdersEntity)
    private readonly ordersRepository: Repository<OrdersEntity>,
  ) {}

  async save(order: OrdersEntity): Promise<OrdersEntity> {
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
