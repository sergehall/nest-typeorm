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
import { CurrentUserDto } from '../../../../features/users/dto/current-user.dto';
import { IfGuestUsersGuard } from '../../../../features/auth/guards/if-guest-users.guard';
import { GuestUsersDto } from '../../../../features/users/dto/guest-users.dto';
import { ProductsRequestDto } from '../../../../features/products/dto/products-request.dto';

@Controller('pay-pal')
export class PayPalController {
  constructor() {}

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
    return 'string';
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
