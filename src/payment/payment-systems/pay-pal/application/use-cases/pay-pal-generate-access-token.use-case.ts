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
      const baseUrl = await this.payPalFactory.getPayPalUrlsDependentEnv();
      const url = baseUrl + '/v1/oauth2/token';

      const { username, password } =
        await this.payPalFactory.getUsernamePassword();

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
