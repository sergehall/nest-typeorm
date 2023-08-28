import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepo } from '../../infrastructure/security-devices.repo';
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
  async execute(command: CreateDeviceCommand): Promise<SecurityDevicesEntity> {
    const { newPayload, clientIp, userAgent } = command;

    return await this.securityDevicesRepo.createDevice(
      newPayload,
      clientIp,
      userAgent,
    );
  }
}
