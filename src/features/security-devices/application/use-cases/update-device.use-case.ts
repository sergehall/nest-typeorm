import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepo } from '../../infrastructure/security-devices.repo';
import { SecurityDevicesEntity } from '../../entities/session-devices.entity';
import { NotFoundException } from '@nestjs/common';

export class UpdateDeviceCommand {
  constructor(
    public newPayload: PayloadDto,
    public clientIp: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(UpdateDeviceCommand)
export class UpdateDeviceUseCase
  implements ICommandHandler<UpdateDeviceCommand>
{
  constructor(private readonly securityDevicesRepo: SecurityDevicesRepo) {}
  async execute(command: UpdateDeviceCommand): Promise<SecurityDevicesEntity> {
    const { newPayload, clientIp, userAgent } = command;

    const updatedDevice = await this.securityDevicesRepo.updateDevice(
      newPayload,
      clientIp,
      userAgent,
    );

    if (!updatedDevice)
      throw new NotFoundException(
        `Device with ID ${newPayload.deviceId} not found`,
      );

    return updatedDevice;
  }
}
