import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import Stripe from 'stripe';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';

export class FinalizeOrderPaymentCommand {
  constructor(public checkoutSessionCompletedObject: Stripe.Checkout.Session) {}
}

@CommandHandler(FinalizeOrderPaymentCommand)
export class FinalizeOrderPaymentUseCase
  implements ICommandHandler<FinalizeOrderPaymentCommand>
{
  constructor(
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: FinalizeOrderPaymentCommand): Promise<string> {
    const { checkoutSessionCompletedObject } = command;

    try {
      const { client_reference_id: clientIdAndOrderId } =
        checkoutSessionCompletedObject;
      if (!clientIdAndOrderId)
        throw new InternalServerErrorException('Invalid client reference ID');

      const [clientId, orderId] = clientIdAndOrderId.split('.');
      const updatedAt = new Date().toISOString();

      await this.paymentTransactionsRepo.completeOrderAndConfirmPayment(
        orderId,
        clientId,
        updatedAt,
        checkoutSessionCompletedObject,
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
