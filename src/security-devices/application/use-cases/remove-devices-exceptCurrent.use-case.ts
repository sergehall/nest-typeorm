import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveDevicesExceptCurrentCommand {
  constructor(public currentPayload: PayloadDto) {}
}

@CommandHandler(RemoveDevicesExceptCurrentCommand)
export class RemoveDevicesExceptCurrentUseCase
  implements ICommandHandler<RemoveDevicesExceptCurrentCommand>
{
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(command: RemoveDevicesExceptCurrentCommand) {
    return await this.securityDevicesRepository.removeDevicesExceptCurrent(
      command.currentPayload,
    );
  }
}
