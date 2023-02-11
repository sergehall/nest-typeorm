import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  HttpException,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { SecurityDevicesService } from './security-devices.service';
import { CookiesJwtVerificationGuard } from '../../auth/guards/cookies-jwt.verification.guard';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { RemoveDevicesExceptCurrentCommand } from './use-cases/remove-devices-exceptCurrent.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveDevicesByDeviceIdCommand } from './use-cases/remove-devices-byDeviceId.use-case';
import jwt_decode from 'jwt-decode';

@SkipThrottle()
@Controller('security')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(CookiesJwtVerificationGuard)
  @Get('devices')
  async findDevices(@Request() req: any) {
    const currentPayload: PayloadDto = jwt_decode(req.cookies.refreshToken);
    return this.securityDevicesService.findDevices(currentPayload);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookiesJwtVerificationGuard)
  @Delete('devices')
  async removeDevicesExceptCurrent(@Request() req: any) {
    const currentPayload: PayloadDto = jwt_decode(req.cookies.refreshToken);
    return await this.commandBus.execute(
      new RemoveDevicesExceptCurrentCommand(currentPayload),
    );
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookiesJwtVerificationGuard)
  @Delete('/devices/:deviceId')
  async removeDeviceByDeviceId(
    @Request() req: any,
    @Param('deviceId') deviceId: string,
  ) {
    const currentPayload: PayloadDto = jwt_decode(req.cookies.refreshToken);
    const result = await this.commandBus.execute(
      new RemoveDevicesByDeviceIdCommand(deviceId, currentPayload),
    );
    if (result === '404') throw new NotFoundException();
    if (result === '403') {
      throw new HttpException(
        {
          message: ['It is forbidden to delete a device that is not your own.'],
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
