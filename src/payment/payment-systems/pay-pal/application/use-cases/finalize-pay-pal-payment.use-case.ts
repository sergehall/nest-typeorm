import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';
import { PayPalEventType } from '../../types/pay-pal-event.type';

export class FinalizePayPalPaymentCommand {
  constructor(public event: PayPalEventType) {}
}

@CommandHandler(FinalizePayPalPaymentCommand)
export class FinalizePayPalPaymentUseCase
  implements ICommandHandler<FinalizePayPalPaymentCommand>
{
  constructor(
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: FinalizePayPalPaymentCommand): Promise<string> {
    const { event } = command;

    try {
      console.log(JSON.stringify(event), 'body');
      console.log('FinalizePayPalPaymentUseCase');
      //   const { client_reference_id: clientIdAndOrderId } =
      //     checkoutSessionCompletedObject;
      //   if (!clientIdAndOrderId)
      //     throw new InternalServerErrorException('Invalid client reference ID');
      //
      //   const [clientId, orderId] = clientIdAndOrderId.split('.');
      //   const updatedAt = new Date().toISOString();
      //
      //   await this.paymentTransactionsRepo.completeOrderAndConfirmPayment(
      //     orderId,
      //     clientId,
      //     updatedAt,
      //     checkoutSessionCompletedObject,
      //   );

      return 'The purchase was successfully completed';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to finalize order payment',
      );
    }
  }
}
