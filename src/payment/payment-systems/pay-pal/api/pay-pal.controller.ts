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
import { Request } from 'express';
import { ParseQueriesService } from '../../../../common/query/parse-queries.service';
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
  //
  // @Post('webhook')
  // async stripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<boolean> {
  //   try {
  //     return await this.commandBus.execute(
  //       new ProcessStripeWebHookCommand(req),
  //     );
  //   } catch (error) {
  //     console.error(error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // @Get('/success')
  // async success(): Promise<string> {
  //   return await this.commandBus.execute(new ProcessStripeSuccessCommand());
  // }

  @Get('cancel')
  async cancel(): Promise<string> {
    return 'The purchase was canceled';
  }
}
