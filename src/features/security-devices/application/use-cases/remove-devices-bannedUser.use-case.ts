import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveDevicesBannedUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(RemoveDevicesBannedUserCommand)
export class RemoveDevicesBannedUserUseCase
  implements ICommandHandler<RemoveDevicesBannedUserCommand>
{
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}
  async execute(command: RemoveDevicesBannedUserCommand) {
    return await this.securityDevicesRepository.removeDevicesBannedUser(
      command.userId,
    );
  }
}
