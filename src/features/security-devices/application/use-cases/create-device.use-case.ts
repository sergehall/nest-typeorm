import { PayloadDto } from '../../../auth/dto/payload.dto';
import { SessionDevicesEntity } from '../../entities/security-device.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRawSqlRepository } from '../../infrastructure/security-devices-raw-sql.repository';

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
  constructor(
    private readonly securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
  ) {}
  async execute(command: CreateDeviceCommand): Promise<boolean> {
    const newDevices: SessionDevicesEntity = {
      userId: command.newPayload.userId,
      ip: command.clientIp,
      title: command.userAgent,
      lastActiveDate: new Date(command.newPayload.iat * 1000).toISOString(),
      expirationDate: new Date(command.newPayload.exp * 1000).toISOString(),
      deviceId: command.newPayload.deviceId,
    };
    return await this.securityDevicesRawSqlRepository.createOrUpdateDevice(
      newDevices,
    );
  }
}
