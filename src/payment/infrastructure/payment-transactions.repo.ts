import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransactionsEntity } from '../../common/products/entities/payment-transaction.entity';

@Injectable()
export class PaymentTransactionsRepo {
  constructor(
    @InjectRepository(PaymentTransactionsEntity)
    private readonly paymentTransactionsEntityRepository: Repository<PaymentTransactionsEntity>,
  ) {}

  async saveReceiptUrl(
    paymentTransaction: PaymentTransactionsEntity,
  ): Promise<PaymentTransactionsEntity> {
    try {
      return await this.paymentTransactionsEntityRepository.save(
        paymentTransaction,
      );
    } catch (error) {
      console.log('Error saving payment transaction:', error);
      throw new InternalServerErrorException(
        'Error saving payment transaction' + error.message,
      );
    }
  }

  async save(
    paymentTransaction: PaymentTransactionsEntity,
  ): Promise<PaymentTransactionsEntity> {
    try {
      return await this.paymentTransactionsEntityRepository.save(
        paymentTransaction,
      );
    } catch (error) {
      console.log('Error saving payment transaction:', error);
      throw new InternalServerErrorException(
        'Error saving payment transaction' + error.message,
      );
    }
  }
}
// "request": {
//     "id": "req_AUVpCdKqvnmLLx",
//     "idempotency_key": "38a40e45-e5ca-499e-9cf1-671bc5554247"
//   },
