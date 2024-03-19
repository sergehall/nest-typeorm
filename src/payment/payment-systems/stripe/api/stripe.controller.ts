import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ProcessStripeWebHookCommand } from '../application/use-cases/process-stripe-webhook.use-case';
import { Request } from 'express';
import { BuyWithStripeCommand } from '../application/use-cases/buy-with-stripe.use-case';
import { ParseQueriesService } from '../../../../common/query/parse-queries.service';
import { ProductsRequestDto } from '../../../../common/products/dto/products-request.dto';
import { CurrentUserDto } from '../../../../features/users/dto/current-user.dto';
import { IfGuestUsersGuard } from '../../../../features/auth/guards/if-guest-users.guard';
import { GuestUsersDto } from '../../../../features/users/dto/guest-users.dto';
import { PaymentLinkDto } from '../../../dto/payment-link.dto';
import { ProcessStripeSuccessCommand } from '../application/use-cases/process-stripe-success.use-case';

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

    // const queryData: ParseQueriesDto =
    //   await this.parseQueriesService.getQueriesData(query);
    // const productsQuery = queryData.products;

    return this.commandBus.execute(
      new BuyWithStripeCommand(productsRequestDto, currentUserDto),
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
    return await this.commandBus.execute(new ProcessStripeSuccessCommand());
  }

  @Get('cancel')
  async cancel(): Promise<string> {
    return 'The purchase was canceled';
  }
}
