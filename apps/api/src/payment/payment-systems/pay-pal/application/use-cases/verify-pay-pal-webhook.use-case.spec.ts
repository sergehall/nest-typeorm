import { RawBodyRequest, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { PayPalConfig } from '../../../../../config/pay-pal/pay-pal.config';
import {
  VerifyPayPalWebhookCommand,
  VerifyPayPalWebhookUseCase,
} from './verify-pay-pal-webhook.use-case';

const payPalHeaders: Record<string, string> = {
  'paypal-auth-algo': 'SHA256withRSA',
  'paypal-cert-url': 'https://api.paypal.com/certificate',
  'paypal-transmission-id': 'transmission-id',
  'paypal-transmission-sig': 'signature',
  'paypal-transmission-time': '2026-08-20T20:45:00Z',
};

function createRequest(): RawBodyRequest<Request> {
  return {
    body: { id: 'event-id', event_type: 'PAYMENT.CAPTURE.COMPLETED' },
    header: (name: string) => payPalHeaders[name.toLowerCase()],
  } as unknown as RawBodyRequest<Request>;
}

describe('VerifyPayPalWebhookUseCase', () => {
  const commandBus = {
    execute: jest.fn().mockResolvedValue('access-token'),
  } as unknown as CommandBus;
  const payPalConfig = {
    getPayPalValue: jest.fn().mockResolvedValue('webhook-id'),
  } as unknown as PayPalConfig;
  const useCase = new VerifyPayPalWebhookUseCase(commandBus, payPalConfig);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('accepts only events PayPal verifies successfully', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ verification_status: 'SUCCESS' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(useCase.execute(new VerifyPayPalWebhookCommand(createRequest()))).resolves.toBe(
      undefined,
    );
  });

  it('rejects events PayPal marks as invalid', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ verification_status: 'FAILURE' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      useCase.execute(new VerifyPayPalWebhookCommand(createRequest())),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
