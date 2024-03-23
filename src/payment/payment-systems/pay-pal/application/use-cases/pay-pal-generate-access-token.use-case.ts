import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { PayPalFactory } from '../../../../../config/pay-pal/pay-pal-factory';

export class PayPalGenerateAccessTokenCommand {
  constructor() {}
}

@CommandHandler(PayPalGenerateAccessTokenCommand)
export class PayPalGenerateAccessTokenUseCase
  implements ICommandHandler<PayPalGenerateAccessTokenCommand>
{
  constructor(private readonly payPalFactory: PayPalFactory) {}

  async execute(): Promise<string> {
    try {
      // const baseUrl = await this.payPalFactory.getPayPalUrlsDependentEnv();
      // const url = baseUrl + '/v1/oauth2/token';
      const url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
      const { username, password } =
        await this.payPalFactory.getUsernamePassword();

      // const response = await axios({
      //   url: url,
      //   method: 'POST',
      //   data: 'grant_type=client_credentials',
      //   auth: {
      //     username: username,
      //     password: password,
      //   },
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded', "Accept: application/json" }
      // });
      const clientId = username;
      const secret = password;
      const data = 'grant_type=client_credentials';
      const config = {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'en_US',
          Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      console.log(url, 'url');
      console.log(clientId, 'clientId');
      console.log(secret, 'secret');
      console.log(config, 'config');

      // https://api-m.sandbox.paypal.com/v1/oauth2/token
      const response = await axios.post(url, data, config);
      console.log(response.data, 'response');
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
