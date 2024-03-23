import { InternalServerErrorException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';
import { PayPalEventType } from '../../types/pay-pal-event.type';
import { PaymentService } from '../../../../application/payment.service';
import { PayPalCapturePaymentCommand } from './pay-pal-capture-payment.use-case';

export class FinalizePayPalPaymentCommand {
  constructor(public body: PayPalEventType) {}
}

@CommandHandler(FinalizePayPalPaymentCommand)
export class FinalizePayPalPaymentUseCase
  implements ICommandHandler<FinalizePayPalPaymentCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentService: PaymentService,
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: FinalizePayPalPaymentCommand): Promise<void> {
    const { body } = command;

    try {
      const { reference_id } = body.resource.purchase_units[0];
      if (!reference_id)
        throw new InternalServerErrorException('Invalid reference ID');

      const { clientId, orderId } =
        await this.paymentService.extractClientAndOrderId(reference_id);

      const updatedAt = new Date().toISOString();

      await this.paymentTransactionsRepo.completeOrderAndConfirmPayment(
        orderId,
        clientId,
        updatedAt,
        body,
      );
      console.log(JSON.stringify(body), 'body');

      // const captureObj = body.resource.links.find(
      //   (link) => link.rel === 'capture',
      // );
      // if (!captureObj)
      //   throw new InternalServerErrorException('Invalid capture link');
      //
      // await this.commandBus.execute(
      //   new PayPalCapturePaymentCommand(captureObj.href, reference_id),
      // );

      // const emailPayee = body.resource.payer.email_address;
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
