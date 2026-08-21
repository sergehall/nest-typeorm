import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalGenerateAccessTokenCommand } from './pay-pal-generate-access-token.use-case';
import { PayPalEventType } from '../../types/pay-pal-event.type';
import { PaymentService } from '../../../../application/payment.service';
import { PaymentTransactionsRepo } from '../../../../infrastructure/payment-transactions.repo';
import { isRecord, requestExternalJson } from '../../../../../common/http/external-json-client';

type PayPalCaptureResponse = {
  readonly id: string;
  readonly status: string;
};

function isPayPalCaptureResponse(value: unknown): value is PayPalCaptureResponse {
  return isRecord(value) && typeof value.id === 'string' && typeof value.status === 'string';
}

export class PayPalCapturePaymentCommand {
  constructor(public body: PayPalEventType) {}
}

@CommandHandler(PayPalCapturePaymentCommand)
export class PayPalCapturePaymentUseCase implements ICommandHandler<PayPalCapturePaymentCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentService: PaymentService,
    private readonly paymentTransactionsRepo: PaymentTransactionsRepo,
  ) {}

  async execute(command: PayPalCapturePaymentCommand): Promise<PayPalCaptureResponse> {
    const { body } = command;
    try {
      const { reference_id } = body.resource.purchase_units[0];
      if (!reference_id) throw new InternalServerErrorException('Invalid reference ID');

      const { clientId, orderId } = await this.paymentService.extractClientAndOrderId(reference_id);

      const { id } = body.resource;

      await this.paymentTransactionsRepo.updateOrderAndPaymentApproved(orderId, clientId, id, body);

      const captureObj = body.resource.links.find((link) => link.rel === 'capture');
      if (!captureObj) throw new InternalServerErrorException('Invalid capture link');

      const accessToken = await this.commandBus.execute(new PayPalGenerateAccessTokenCommand());

      return await requestExternalJson({
        provider: 'PayPal Capture API',
        url: captureObj.href,
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PayPal-Request-Id': reference_id,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        },
        validate: isPayPalCaptureResponse,
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException('Failed to PayPalCapturePayment', { cause: error });
    }
  }
}
