import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EnvNamesEnums } from '../enums/env-names.enums';
import { NodeEnvConfig } from '../node-env/node-env.config';
import { PayPalConfig } from './pay-pal.config';
import { PayPalUrlsEnum } from '../../payment/payment-systems/pay-pal/enums/pay-pal-urls.enum';

@Injectable()
export class PayPalFactory {
  constructor(
    private readonly nodeEnvConfig: NodeEnvConfig,
    private readonly payPalConfig: PayPalConfig,
  ) {}

  async getUsernamePassword(): Promise<{
    username: string;
    password: string;
  }> {
    const envNames: EnvNamesEnums = await this.nodeEnvConfig.getValueENV();

    let usernamePassword = { username: '', password: '' };

    switch (envNames) {
      case 'test':
      case 'development':
      case 'staging':
      case 'sandbox':
        usernamePassword = await this.getSandboxUsernamePassword();
        break;
      case 'production':
      case 'live':
        usernamePassword = await this.getLiveUsernamePassword();
        break;
      default:
        throw new InternalServerErrorException('Invalid API environment');
    }

    return usernamePassword;
  }

  async getPayPalUrlsDependentEnv(): Promise<string> {
    const envNames: EnvNamesEnums = await this.nodeEnvConfig.getValueENV();

    let url: string;

    switch (envNames) {
      case 'test':
      case 'development':
      case 'staging':
      case 'sandbox':
        url = PayPalUrlsEnum.BaseSandboxApi;
        break;
      case 'production':
      case 'live':
        url = PayPalUrlsEnum.BaseApi;
        break;
      default:
        throw new InternalServerErrorException('Invalid API environment');
    }

    return url;
  }

  async getSandboxUsernamePassword(): Promise<{
    username: string;
    password: string;
  }> {
    const username: string =
      await this.payPalConfig.getPayPalConfig('PAYPAL_CLIENT_ID');
    const password: string = await this.payPalConfig.getPayPalConfig(
      'PAYPAL_CLIENT_SECRET',
    );
    return { username, password };
  }

  async getLiveUsernamePassword(): Promise<{
    username: string;
    password: string;
  }> {
    const username: string =
      await this.payPalConfig.getPayPalConfig('PAYPAL_CLIENT_ID');
    const password: string = await this.payPalConfig.getPayPalConfig(
      'PAYPAL_CLIENT_SECRET',
    );
    return { username, password };
  }
}
