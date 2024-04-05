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
import { CookiesJwtVerificationGuard } from '../../auth/guards/cookies-jwt.verification.guard';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { RemoveDevicesExceptCurrentCommand } from '../application/use-cases/remove-devices-except-current.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveDevicesByDeviceIdCommand } from '../application/use-cases/remove-devices-by-deviceId.use-case';
import { DeviceIdParams } from '../../../common/query/params/deviceId.params';
import { SecurityDeviceViewModel } from '../views/security-device.view-model';
import { SkipThrottle } from '@nestjs/throttler';
import { SearchDevicesCommand } from '../application/use-cases/search-devices.use-case';
import { AuthService } from '../../auth/application/auth.service';
import { ApiTags } from '@nestjs/swagger';

@SkipThrottle()
@ApiTags('Security')
@Controller('security')
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(CookiesJwtVerificationGuard)
  @Get('devices')
  async findDevices(@Request() req: any): Promise<SecurityDeviceViewModel[]> {
    const currentPayload: PayloadDto = await this.authService.toExtractPayload(
      req.cookies.refreshToken,
    );

    return await this.commandBus.execute(
      new SearchDevicesCommand(currentPayload),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookiesJwtVerificationGuard)
  @Delete('devices')
  async removeDevicesExceptCurrent(@Request() req: any): Promise<boolean> {
    const currentPayload: PayloadDto = await this.authService.toExtractPayload(
      req.cookies.refreshToken,
    );

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
    const currentPayload: PayloadDto = await this.authService.toExtractPayload(
      req.cookies.refreshToken,
    );

    return await this.commandBus.execute(
      new RemoveDevicesByDeviceIdCommand(params.deviceId, currentPayload),
    );
  }
}
