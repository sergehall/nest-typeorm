import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';

export class FinalizePayPalPaymentCommand {
  constructor(public checkoutObject: any) {}
}

@CommandHandler(FinalizePayPalPaymentCommand)
export class FinalizePayPalPaymentUseCase
  implements ICommandHandler<FinalizePayPalPaymentCommand>
{
  constructor(
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: FinalizePayPalPaymentCommand): Promise<string> {
    const { checkoutObject } = command;

    try {
      console.log(checkoutObject, 'checkoutObject');
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
