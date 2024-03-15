import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { BuyRequestDto } from '../../blogs/dto/buy-request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { BuyProductsCommand } from '../application/use-cases/buy-products.use-case';
import { ProcessStripeWebHookCommand } from '../application/use-cases/process-stripe-webhook.use-case';
import Stripe from 'stripe';
import { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/buy')
  // @UseGuards(JwtAuthGuard)
  async buy(
    @Body() buyRequest: BuyRequestDto,
    @Req() req: any,
  ): Promise<string> {
    const currentUserDto: CurrentUserDto = req.user;
    return this.commandBus.execute(
      new BuyProductsCommand(buyRequest, currentUserDto),
    );
  }

  @Post('webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() data: Stripe.Checkout.Session,
  ): Promise<boolean> {
    try {
      // console.log(JSON.stringify(data), 'stripeWebhook');
      // const payloadStripe = JSON.parse(JSON.stringify(payload));

      return await this.commandBus.execute(
        new ProcessStripeWebHookCommand(req, data),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/success')
  async success(): Promise<string> {
    return 'The purchase was successfully completed';
  }

  @Get('cancel')
  async cancel(): Promise<string> {
    return 'The purchase was canceled';
  }
}
