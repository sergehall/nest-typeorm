import { PayloadDto } from '../../../auth/dto/payload.dto';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveDevicesByDeviceIdCommand {
  constructor(public deviceId: string, public currentPayload: PayloadDto) {}
}

@CommandHandler(RemoveDevicesByDeviceIdCommand)
export class RemoveDevicesByDeviceIdUseCase
  implements ICommandHandler<RemoveDevicesByDeviceIdCommand>
{
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}
  async execute(command: RemoveDevicesByDeviceIdCommand) {
    return await this.securityDevicesRepository.removeDeviceByDeviceId(
      command.deviceId,
      command.currentPayload,
    );
  }
}
