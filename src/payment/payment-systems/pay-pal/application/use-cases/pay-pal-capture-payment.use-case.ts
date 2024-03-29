import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalGenerateAccessTokenCommand } from './pay-pal-generate-access-token.use-case';
import { PayPalEventType } from '../../types/pay-pal-event.type';
import { PaymentService } from '../../../../application/payment.service';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';

export class PayPalCapturePaymentCommand {
  constructor(public body: PayPalEventType) {}
}

@CommandHandler(PayPalCapturePaymentCommand)
export class PayPalCapturePaymentUseCase
  implements ICommandHandler<PayPalCapturePaymentCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentService: PaymentService,
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: PayPalCapturePaymentCommand): Promise<any> {
    const { body } = command;
    try {
      const { reference_id } = body.resource.purchase_units[0];
      if (!reference_id)
        throw new InternalServerErrorException('Invalid reference ID');

      const { clientId, orderId } =
        await this.paymentService.extractClientAndOrderId(reference_id);

      const { id } = body.resource;

      await this.paymentTransactionsRepo.updateOrderAndPaymentApproved(
        orderId,
        clientId,
        id,
        body,
      );

      const captureObj = body.resource.links.find(
        (link) => link.rel === 'capture',
      );
      if (!captureObj)
        throw new InternalServerErrorException('Invalid capture link');

      const accessToken = await this.commandBus.execute(
        new PayPalGenerateAccessTokenCommand(),
      );

      return await axios.post(
        captureObj.href,
        {},
        {
          headers: {
            'PayPal-Request-Id': reference_id,
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to PayPalCapturePayment',
        error.message,
      );
    }
  }
}
