import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayPalUrlsEnum } from '../../enums/pay-pal-urls.enum';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
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
      const baseUrl = PayPalUrlsEnum.BaseSandboxApi;
      const url = baseUrl + '/v1/oauth2/token';

      const username: string =
        await this.payPalConfig.getPayPalConfig('PAYPAL_CLIENT_ID');
      const password: string = await this.payPalConfig.getPayPalConfig(
        'PAYPAL_CLIENT_SECRET',
      );

      const response = await axios({
        url: url,
        method: 'POST',
        data: 'grant_type=client_credentials',
        auth: {
          username: username,
          password: password,
        },
      });

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
