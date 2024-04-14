import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalUrlsEnum } from '../../enums/pay-pal-urls.enum';
import { PayPalConfig } from '../../../../../config/pay-pal/pay-pal.config';

export class PayPalGenerateAccessTokenCommand {
  constructor() {}
}

@CommandHandler(PayPalGenerateAccessTokenCommand)
export class PayPalGenerateAccessTokenUseCase
  implements ICommandHandler<PayPalGenerateAccessTokenCommand>
{
  constructor(private readonly payPalConfig: PayPalConfig) {}

  async execute(): Promise<string> {
    try {
      // const baseUrl = await this.payPalFactory.getPayPalUrl();
      // const url = baseUrl + '/v1/oauth2/token';
      const baseUrl = PayPalUrlsEnum.BaseSandboxApi;
      const url = baseUrl + '/v1/oauth2/token';

      const username =
        await this.payPalConfig.getPayPalValue('PAYPAL_CLIENT_ID');
      const password = await this.payPalConfig.getPayPalValue(
        'PAYPAL_CLIENT_SECRET',
      );

      const data = 'grant_type=client_credentials';
      const config = {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'en_US',
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios.post(url, data, config);

      return response.data.access_token;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'Failed to generate access token',
        error.message,
      );
    }
  }
}
