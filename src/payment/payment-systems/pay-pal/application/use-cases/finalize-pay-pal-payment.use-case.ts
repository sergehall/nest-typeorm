import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';
import { PayPalCompletedEventType } from '../../types/pay-pal-completed-event.type';

export class FinalizePayPalPaymentCommand {
  constructor(public body: PayPalCompletedEventType) {}
}

@CommandHandler(FinalizePayPalPaymentCommand)
export class FinalizePayPalPaymentUseCase
  implements ICommandHandler<FinalizePayPalPaymentCommand>
{
  constructor(
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: FinalizePayPalPaymentCommand): Promise<void> {
    const { body } = command;

    try {
      const { order_id } = body.resource.supplementary_data.related_ids;

      if (!order_id)
        throw new InternalServerErrorException('Invalid reference related_ids');

      await this.paymentTransactionsRepo.completedPayment(order_id, body);

      // const emailPayee = body.resource.payer.email_address;
      // Send email to the payee
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to finalize order payment',
      );
    }
  }
}
