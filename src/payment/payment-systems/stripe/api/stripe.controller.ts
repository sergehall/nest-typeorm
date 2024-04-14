import {
  Body,
  Controller,
  Get,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ProcessStripeWebHookCommand } from '../application/use-cases/process-stripe-webhook.use-case';
import { Request } from 'express';
import { ProcessStripeSuccessCommand } from '../application/use-cases/process-stripe-success.use-case';
import { PaymentLinkDto } from '../../../dto/payment-link.dto';
import { PaymentSystem } from '../../../enums/payment-system.enums';
import { BuyProductsCommand } from '../../../application/use-cases/buy-products.use-case';
import { ApiTags } from '@nestjs/swagger';
import { ParseQueriesService } from '../../../../common/query/parse-queries.service';
import { IfGuestUsersGuard } from '../../../../features/auth/guards/if-guest-users.guard';
import { ProductsRequestDto } from '../../../../features/products/dto/products-request.dto';
import { CurrentUserDto } from '../../../../features/users/dto/current-user.dto';
import { GuestUsersDto } from '../../../../features/users/dto/guest-users.dto';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly parseQueriesService: ParseQueriesService,
  ) {}

  @Get('buy/products')
  @UseGuards(IfGuestUsersGuard)
  async buy(
    @Body() productsRequestDto: ProductsRequestDto,
    @Req() req: any,
    // @Query() query: any,
  ): Promise<PaymentLinkDto | null> {
    const currentUserDto: CurrentUserDto | GuestUsersDto = req.user;
    const paymentSystem = PaymentSystem.STRIPE;
    // const queryData: ParseQueriesDto =
    //   await this.parseQueriesService.getQueriesData(query);
    // const productsQuery = queryData.products;

    return this.commandBus.execute(
      new BuyProductsCommand(paymentSystem, productsRequestDto, currentUserDto),
    );
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<boolean> {
    return await this.commandBus.execute(new ProcessStripeWebHookCommand(req));
  }

  @Get('/success')
  async success(): Promise<string> {
    return await this.commandBus.execute(new ProcessStripeSuccessCommand());
  }

  @Get('cancel')
  async cancel(): Promise<string> {
    return 'The purchase was canceled';
  }
}
