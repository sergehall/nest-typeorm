import {
  Body,
  Controller,
  Get,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { IfGuestUsersGuard } from '../../../../features/auth/guards/if-guest-users.guard';
import { ProductsRequestDto } from '../../../../features/products/dto/products-request.dto';
import { CurrentUserDto } from '../../../../features/users/dto/current-user.dto';
import { GuestUsersDto } from '../../../../features/users/dto/guest-users.dto';
import { PaymentSystem } from '../../../enums/payment-system.enums';
import { BuyProductsCommand } from '../../../application/use-cases/buy-products.use-case';
import { ProcessPayPalWebhookCommand } from '../application/use-cases/process-pay-pal-webhook.use-case';

@Controller('pay-pal')
export class PayPalController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('buy/products')
  @UseGuards(IfGuestUsersGuard)
  async buy(
    @Body() productsRequestDto: ProductsRequestDto,
    @Req() req: any,
    // @Query() query: any,
  ): Promise<string> {
    const currentUserDto: CurrentUserDto | GuestUsersDto = req.user;
    const paymentSystem: PaymentSystem.PAYPAL = PaymentSystem.PAYPAL;

    // const queryData: ParseQueriesDto =
    //   await this.parseQueriesService.getQueriesData(query);
    // const productsQuery = queryData.products;

    return this.commandBus.execute(
      new BuyProductsCommand(paymentSystem, productsRequestDto, currentUserDto),
    );
  }

  @Post('webhooks')
  async payPalWebhook(@Req() req: RawBodyRequest<Request>): Promise<boolean> {
    return await this.commandBus.execute(new ProcessPayPalWebhookCommand(req));
  }

  @Get('success')
  async success(): Promise<string> {
    return 'The purchase was successful';
  }

  @Get('cancel')
  async cancel(): Promise<string> {
    return 'The purchase was canceled';
  }
}
