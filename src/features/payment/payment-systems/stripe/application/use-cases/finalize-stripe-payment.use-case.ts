import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import Stripe from 'stripe';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';
import { PaymentService } from '../../../../application/payment.service';

export class FinalizeStripePaymentCommand {
  constructor(public session: Stripe.Checkout.Session) {}
}

@CommandHandler(FinalizeStripePaymentCommand)
export class FinalizeStripePaymentUseCase
  implements ICommandHandler<FinalizeStripePaymentCommand>
{
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: FinalizeStripePaymentCommand): Promise<void> {
    const { session } = command;

    try {
      const { client_reference_id: clientIdAndOrderId } = session;
      if (!clientIdAndOrderId)
        throw new InternalServerErrorException('Invalid client reference ID');

      const updatedAt = new Date().toISOString();
      const { clientId, orderId } =
        await this.paymentService.extractClientAndOrderId(clientIdAndOrderId);

      await this.paymentTransactionsRepo.updateOrderAndPayment(
        orderId,
        clientId,
        updatedAt,
        session,
      );
      // const emailPayee = session.customer_details?.email;
      // or?
      // const emailPayee = session.customer_email;
      // Send email to the payee

      console.log(
        `The purchase orderId: ${orderId} by clientId: ${clientId} was successfully completed`,
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to finalize order payment',
      );
    }
  }
}
