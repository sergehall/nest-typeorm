import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import Stripe from 'stripe';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';

export class FinalizeStripePaymentCommand {
  constructor(public checkoutSessionCompletedObject: Stripe.Checkout.Session) {}
}

@CommandHandler(FinalizeStripePaymentCommand)
export class FinalizeStripePaymentUseCase
  implements ICommandHandler<FinalizeStripePaymentCommand>
{
  constructor(
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: FinalizeStripePaymentCommand): Promise<string> {
    const { checkoutSessionCompletedObject } = command;

    try {
      const { client_reference_id: clientIdAndOrderId } =
        checkoutSessionCompletedObject;
      if (!clientIdAndOrderId)
        throw new InternalServerErrorException('Invalid client reference ID');

      const updatedAt = new Date().toISOString();
      const [clientId, orderId] = clientIdAndOrderId.split('.');
      console.log('clientIdAndOrderId: ', clientIdAndOrderId);
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
