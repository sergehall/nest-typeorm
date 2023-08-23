import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as uuid4 from 'uuid4';
import { SecurityDevicesRepo } from '../../infrastructure/security-devices.repo';
import { UsersEntity } from '../../../users/entities/users.entity';
import { SecurityDevicesEntity } from '../../entities/session-devices.entity';

export class CreateDeviceCommand {
  constructor(
    public newPayload: PayloadDto,
    public clientIp: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase
  implements ICommandHandler<CreateDeviceCommand>
{
  constructor(private readonly securityDevicesRepo: SecurityDevicesRepo) {}
  async execute(command: CreateDeviceCommand): Promise<boolean> {
    const { newPayload, clientIp, userAgent } = command;

    const user = new UsersEntity();
    user.userId = newPayload.userId;

    const newDevices: SecurityDevicesEntity = {
      id: uuid4().toString(),
      deviceId: newPayload.deviceId,
      ip: clientIp,
      title: userAgent,
      lastActiveDate: new Date(newPayload.iat * 1000).toISOString(),
      expirationDate: new Date(newPayload.exp * 1000).toISOString(),
      user: user,
    };
    await this.securityDevicesRepo.createDevice(newDevices);
    return true;
  }
}
