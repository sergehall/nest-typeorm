import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RawBodyRequest, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { isRecord, requestExternalJson } from '../../../../../common/http/external-json-client';
import { PayPalConfig } from '../../../../../config/pay-pal/pay-pal.config';
import { getPayPalApiBaseUrl } from '../../enums/pay-pal-urls.enum';
import { PayPalGenerateAccessTokenCommand } from './pay-pal-generate-access-token.use-case';

type PayPalVerificationResponse = {
  readonly verification_status: 'SUCCESS' | 'FAILURE';
};

function isPayPalVerificationResponse(value: unknown): value is PayPalVerificationResponse {
  return (
    isRecord(value) &&
    (value.verification_status === 'SUCCESS' || value.verification_status === 'FAILURE')
  );
}

function requiredHeader(request: Request, name: string): string {
  const value = request.header(name);
  if (!value) {
    throw new UnauthorizedException(`Missing PayPal ${name} header.`);
  }
  return value;
}

export class VerifyPayPalWebhookCommand {
  constructor(public readonly request: RawBodyRequest<Request>) {}
}

@CommandHandler(VerifyPayPalWebhookCommand)
export class VerifyPayPalWebhookUseCase implements ICommandHandler<VerifyPayPalWebhookCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly payPalConfig: PayPalConfig,
  ) {}

  async execute(command: VerifyPayPalWebhookCommand): Promise<void> {
    const request = command.request;
    if (!isRecord(request.body)) {
      throw new UnauthorizedException('Invalid PayPal webhook payload.');
    }

    const accessToken = await this.commandBus.execute<PayPalGenerateAccessTokenCommand, string>(
      new PayPalGenerateAccessTokenCommand(),
    );
    const webhookId = await this.payPalConfig.getPayPalValue('PAYPAL_WEBHOOK_ID');
    const response = await requestExternalJson({
      provider: 'PayPal Webhook Verification API',
      url: `${getPayPalApiBaseUrl()}/v1/notifications/verify-webhook-signature`,
      init: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: requiredHeader(request, 'paypal-auth-algo'),
          cert_url: requiredHeader(request, 'paypal-cert-url'),
          transmission_id: requiredHeader(request, 'paypal-transmission-id'),
          transmission_sig: requiredHeader(request, 'paypal-transmission-sig'),
          transmission_time: requiredHeader(request, 'paypal-transmission-time'),
          webhook_id: webhookId,
          webhook_event: request.body,
        }),
      },
      validate: isPayPalVerificationResponse,
    });

    if (response.verification_status !== 'SUCCESS') {
      throw new UnauthorizedException('Invalid PayPal webhook signature.');
    }
  }
}
