import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalUrlsEnum } from '../../enums/pay-pal-urls.enum';
import { PayPalConfig } from '../../../../../config/pay-pal/pay-pal.config';
import { isRecord, requestExternalJson } from '../../../../../common/http/external-json-client';

type PayPalAccessTokenResponse = {
  readonly access_token: string;
};

function isPayPalAccessTokenResponse(value: unknown): value is PayPalAccessTokenResponse {
  return isRecord(value) && typeof value.access_token === 'string';
}

export class PayPalGenerateAccessTokenCommand {
  constructor() {}
}

@CommandHandler(PayPalGenerateAccessTokenCommand)
export class PayPalGenerateAccessTokenUseCase implements ICommandHandler<PayPalGenerateAccessTokenCommand> {
  constructor(private readonly payPalConfig: PayPalConfig) {}

  async execute(): Promise<string> {
    try {
      // const baseUrl = await this.payPalFactory.getPayPalUrl();
      // const url = baseUrl + '/v1/oauth2/token';
      const baseUrl = PayPalUrlsEnum.BaseSandboxApi;
      const url = baseUrl + '/v1/oauth2/token';

      const username = await this.payPalConfig.getPayPalValue('PAYPAL_CLIENT_ID');
      const password = await this.payPalConfig.getPayPalValue('PAYPAL_CLIENT_SECRET');

      const data = 'grant_type=client_credentials';
      const response = await requestExternalJson({
        provider: 'PayPal OAuth API',
        url,
        init: {
          method: 'POST',
          body: data,
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'en_US',
            Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
        validate: isPayPalAccessTokenResponse,
      });

      return response.access_token;
    } catch (error: unknown) {
      throw new InternalServerErrorException('Failed to generate access token', { cause: error });
    }
  }
}
