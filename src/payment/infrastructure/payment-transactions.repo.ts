import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransactionsEntity } from '../../features/products/entities/payment-transaction.entity';
import Stripe from 'stripe';
import { PaymentsStatusEnum } from '../../features/products/enums/payments-status.enum';

@Injectable()
export class PaymentTransactionsRepo {
  constructor(
    @InjectRepository(PaymentTransactionsEntity)
    private readonly paymentTransactionsRepository: Repository<PaymentTransactionsEntity>,
  ) {}
  async confirmPayment(
    orderId: string,
    updatedAt: string,
    checkoutSessionCompletedObject: Stripe.Checkout.Session,
  ): Promise<boolean> {
    try {
      const paymentTransaction = await this.paymentTransactionsRepository
        .createQueryBuilder('paymentTransaction')
        .leftJoinAndSelect('paymentTransaction.order', 'order')
        .where('paymentTransaction.orderId = :orderId', { orderId })
        .andWhere('paymentTransaction.paymentStatus = :paymentStatus', {
          paymentStatus: PaymentsStatusEnum.PENDING,
        })
        .select(['paymentTransaction.id', 'paymentTransaction.status'])
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

      const updateResult = await this.paymentTransactionsRepository.update(
        paymentTransaction.id,
        paymentTransaction,
      );

      return updateResult.affected === 1;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to confirm payment and update data',
      );
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
