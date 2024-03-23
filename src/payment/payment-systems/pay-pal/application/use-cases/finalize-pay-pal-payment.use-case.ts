import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';
import { PayPalEventType } from '../../types/pay-pal-event.type';

export class FinalizePayPalPaymentCommand {
  constructor(public body: PayPalEventType) {}
}

@CommandHandler(FinalizePayPalPaymentCommand)
export class FinalizePayPalPaymentUseCase
  implements ICommandHandler<FinalizePayPalPaymentCommand>
{
  constructor(
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: FinalizePayPalPaymentCommand): Promise<string> {
    const { body } = command;

    try {
      const { reference_id } = body.resource.purchase_units[0];
      console.log(JSON.stringify(body), 'body: ');
      console.log(body.resource.purchase_units[0], 'reference_id: ');
      if (!reference_id)
        throw new InternalServerErrorException('Invalid reference ID');

      const updatedAt = new Date().toISOString();
      const [clientId, orderId] =
        body.resource.purchase_units[0].reference_id.split('.');

      await this.paymentTransactionsRepo.completeOrderAndConfirmPayment(
        orderId,
        clientId,
        updatedAt,
        body,
      );

      return 'The purchase was successfully completed';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to finalize order payment',
      );
    }
  }
}
