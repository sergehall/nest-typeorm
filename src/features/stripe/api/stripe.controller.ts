import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { BuyRequestDto } from '../../blogs/dto/buy-request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { BuyProductsCommand } from '../application/use-cases/buy-products.use-case';
import { ProcessStripeWebHookCommand } from '../application/use-cases/process-stripe-webhook.use-case';
import { Request } from 'express';
import { PaymentSystem } from '../../../common/payment/enums/payment-system.enums';
import { ParseQueriesDto } from '../../../common/query/dto/parse-queries.dto';
import { ParseQueriesService } from '../../../common/query/parse-queries.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly commandBus: CommandBus,
    protected parseQueriesService: ParseQueriesService,
  ) {}

  @Get('buy/products')
  // @UseGuards(NoneStatusGuard)
  async buy(
    @Body() buyRequest: BuyRequestDto,
    @Req() req: any,
    @Query() query: any,
  ): Promise<string> {
    const currentUserDto: CurrentUserDto | null = req.user;
    const queryData: ParseQueriesDto =
      await this.parseQueriesService.getQueriesData(query);
    const products = queryData.products;

    console.log(buyRequest, 'buyRequest');
    console.log(products, 'queryData.products');

    // // Assuming you want to use Stripe for payment
    // const paymentSystem = PaymentSystem.STRIPE;
    // return this.commandBus.execute(
    //   new BuyProductsCommand(buyRequest, paymentSystem, currentUserDto),
    // );
    return 'Good';
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
