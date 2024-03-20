import {
  Body,
  Controller,
  Get,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserDto } from '../../../../features/users/dto/current-user.dto';
import { IfGuestUsersGuard } from '../../../../features/auth/guards/if-guest-users.guard';
import { GuestUsersDto } from '../../../../features/users/dto/guest-users.dto';
import { ProductsRequestDto } from '../../../../features/products/dto/products-request.dto';
import { CommandBus } from '@nestjs/cqrs';

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

    // const queryData: ParseQueriesDto =
    //   await this.parseQueriesService.getQueriesData(query);
    // const productsQuery = queryData.products;

    // return this.commandBus.execute(
    //   new BuyWithStripeCommand(productsRequestDto, currentUserDto),
    // );
    // return this.commandBus.execute(
    //   new BuyWithPayPalCommand(productsRequestDto, currentUserDto),
    // );
    return 'The purchase was successful';
  }

  @Post('webhooks')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<boolean> {
    console.log(req);
    // return await this.commandBus.execute(
    //   new ProcessStripeWebHookCommand(req),
    // );
    return true;
  }

  // @Get('/success')
  // async success(): Promise<string> {
  //   return await this.commandBus.execute(new ProcessStripeSuccessCommand());
  // }

  @Get('cancel')
  async cancel(): Promise<string> {
    return 'The purchase was canceled';
  }
}
