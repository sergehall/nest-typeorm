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
import { RemoveDevicesExceptCurrentCommand } from '../application/use-cases/remove-devices-except-current.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveDevicesByDeviceIdCommand } from '../application/use-cases/remove-devices-by-deviceId.use-case';
import { DeviceIdParams } from '../../../common/query/params/deviceId.params';
import { ReturnSecurityDeviceEntity } from '../entities/return-security-device.entity';
import { DecodeTokenService } from '../../../config/jwt/decode.service/decode-token-service';
import { SkipThrottle } from '@nestjs/throttler';
import { SearchDevicesCommand } from '../application/use-cases/search-devices.use-case';

@SkipThrottle()
@Controller('security')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly decodeTokenService: DecodeTokenService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(CookiesJwtVerificationGuard)
  @Get('devices')
  async findDevices(
    @Request() req: any,
  ): Promise<ReturnSecurityDeviceEntity[]> {
    const currentPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(req.cookies.refreshToken);

    return await this.commandBus.execute(
      new SearchDevicesCommand(currentPayload),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookiesJwtVerificationGuard)
  @Delete('devices')
  async removeDevicesExceptCurrent(@Request() req: any): Promise<boolean> {
    const currentPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(req.cookies.refreshToken);

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
    const currentPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(req.cookies.refreshToken);

    return await this.commandBus.execute(
      new RemoveDevicesByDeviceIdCommand(params.deviceId, currentPayload),
    );
  }
}
