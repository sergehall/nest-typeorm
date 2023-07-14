import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { SecurityDevicesService } from '../application/security-devices.service';
import { CookiesJwtVerificationGuard } from '../../auth/guards/cookies-jwt.verification.guard';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { RemoveDevicesExceptCurrentCommand } from '../application/use-cases/remove-devices-exceptCurrent.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveDevicesByDeviceIdCommand } from '../application/use-cases/remove-devices-byDeviceId.use-case';
import jwt_decode from 'jwt-decode';
import { DeviceIdParams } from '../../common/params/deviceId.params';
import { ReturnSecurityDeviceEntity } from '../entities/return-security-device.entity';

@SkipThrottle()
@Controller('security')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(CookiesJwtVerificationGuard)
  @Get('devices')
  async findDevices(
    @Request() req: any,
  ): Promise<ReturnSecurityDeviceEntity[]> {
    const currentPayload: PayloadDto = jwt_decode(req.cookies.refreshToken);
    return this.securityDevicesService.findDevices(currentPayload);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookiesJwtVerificationGuard)
  @Delete('devices')
  async removeDevicesExceptCurrent(@Request() req: any): Promise<boolean> {
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
    @Param() params: DeviceIdParams,
  ): Promise<boolean> {
    const currentPayload: PayloadDto = jwt_decode(req.cookies.refreshToken);
    return await this.commandBus.execute(
      new RemoveDevicesByDeviceIdCommand(params.deviceId, currentPayload),
    );
  }
}
