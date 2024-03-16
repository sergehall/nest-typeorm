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
import { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/buy')
  // @UseGuards(NoneStatusGuard)
  async buy(
    @Body() buyRequest: BuyRequestDto,
    @Req() req: any,
  ): Promise<string> {
    const currentUserDto: CurrentUserDto | null = req.user;
    console.log(currentUserDto, 'currentUserDto buy');
    return this.commandBus.execute(
      new BuyProductsCommand(buyRequest, currentUserDto),
    );
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<boolean> {
    try {
      return await this.commandBus.execute(
        new ProcessStripeWebHookCommand(req),
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
