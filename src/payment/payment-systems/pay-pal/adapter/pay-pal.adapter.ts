import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PayPalGenerateAccessTokenCommand } from '../application/use-cases/pay-pal-generate-access-token.use-case';
import { CommandBus } from '@nestjs/cqrs';
import axios from 'axios';
import { PaymentDto } from '../../../dto/payment.dto';
import { IntentsEnums } from '../../../enums/intents.enums';
import {
  Amount,
  Item,
  PayPaPurchaseUnitsType,
} from '../../types/pay-pal-create-order.type';
import * as uuid4 from 'uuid4';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { PayPalFactory } from '../../../../config/pay-pal/pay-pal-factory';

@Injectable()
export class PayPalAdapter {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly payPalFactory: PayPalFactory,
    private readonly postgresConfig: PostgresConfig,
  ) {}

  async createCheckoutOrder(paymentDto: PaymentDto[]): Promise<any> {
    try {
      const accessToken = await this.generateAccessToken();

      return await this.payPalCreateOrder(paymentDto, accessToken);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'Failed to createCheckoutOrder' + error.message,
      );
    }
  }

  private async payPalCreateOrder(
    paymentDto: PaymentDto[],
    accessToken: string,
  ) {
    const baseUrl = await this.payPalFactory.getPayPalUrlsDependentEnv();
    const path = '/v2/checkout/orders';
    const url = baseUrl + path;
    const headersOption = await this.getHeadersOptions(accessToken);

    const mapToPurchaseUnits = await this.mapToPurchaseUnits(paymentDto);
    const paymentSource = await this.getPaymentSource();

    const data = {
      intent: IntentsEnums.CAPTURE,
      purchase_units: mapToPurchaseUnits,
      payment_source: paymentSource,
    };

    try {
      const response = await axios.post(url, data, headersOption);
      return response.data;
    } catch (error) {
      console.error('Error:', error.response.data);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async mapToPurchaseUnits(
    paymentDto: PaymentDto[],
  ): Promise<PayPaPurchaseUnitsType[] | null> {
    if (!paymentDto || paymentDto.length === 0) {
      return null;
    }
    const purchaseUnits: PayPaPurchaseUnitsType[] = [];

    const shipping = {
      address: {
        address_line_1: 'Hollywood 123',
        address_line_2: 'apt. 17',
        admin_area_2: 'Los Angeles',
        admin_area_1: 'CA',
        postal_code: '95131',
        country_code: 'US',
      },
    };

    const referenceId = paymentDto[0].orderId;
    const currencyCode = paymentDto[0].currency;

    const items: Item[] = [];
    let totalAmount = 0;

    for (const payment of paymentDto) {
      const item: Item = {
        name: payment.name,
        description: payment.description,
        quantity: payment.quantity.toString(),
        unit_amount: {
          currency_code: payment.currency,
          value: payment.unitAmount,
        },
      };
      items.push(item);

      // Accumulate total amount
      totalAmount += parseFloat(payment.unitAmount) * payment.quantity;
    }

    // Set total amount for all items
    const amount: Amount = {
      currency_code: currencyCode,
      value: totalAmount.toFixed(2),
      breakdown: {
        item_total: {
          currency_code: currencyCode,
          value: totalAmount.toFixed(2),
        },
      },
    };

    purchaseUnits.push({
      reference_id: referenceId,
      items: items,
      amount: amount,
      shipping: shipping,
    });

    return purchaseUnits;
  }

  private async getHeadersOptions(accessToken: string): Promise<any> {
    return {
      headers: {
        'Content-Type': 'application/json',
        'PayPal-Request-Id': uuid4(),
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  private async getPaymentSource(): Promise<any> {
    const domain: string =
      await this.postgresConfig.getPostgresConfig('PG_DOMAIN_HEROKU');
    return {
      paypal: {
        experience_context: {
          payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
          brand_name: 'IT-INCUBATOR INC',
          locale: 'en-US',
          landing_page: 'NO_PREFERENCE',
          shipping_preference: 'SET_PROVIDED_ADDRESS',
          payment_method_selected: 'PAYPAL',
          user_action: 'PAY_NOW',
          return_url: domain + '/pay-pal/return',
          cancel_url: domain + '/pay-pal/cancel',
        },
      },
    };
  }

  async generateAccessToken(): Promise<string> {
    return this.commandBus.execute(new PayPalGenerateAccessTokenCommand());
  }
}
