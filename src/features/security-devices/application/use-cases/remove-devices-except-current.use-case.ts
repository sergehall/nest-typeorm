import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepo } from '../../infrastructure/security-devices.repo';

export class RemoveDevicesExceptCurrentCommand {
  constructor(public currentPayload: PayloadDto) {}
}

@CommandHandler(RemoveDevicesExceptCurrentCommand)
export class RemoveDevicesExceptCurrentUseCase
  implements ICommandHandler<RemoveDevicesExceptCurrentCommand>
{
  constructor(protected securityDevicesRepo: SecurityDevicesRepo) {}

  async execute(command: RemoveDevicesExceptCurrentCommand): Promise<boolean> {
    const { currentPayload } = command;

    return await this.securityDevicesRepo.deleteDevicesExceptCurrent(
      currentPayload,
    );
  }
}
