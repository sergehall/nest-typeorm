import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRawSqlRepository } from '../../infrastructure/security-devices-raw-sql.repository';

export class RemoveDevicesBannedUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(RemoveDevicesBannedUserCommand)
export class RemoveDevicesBannedUserUseCase
  implements ICommandHandler<RemoveDevicesBannedUserCommand>
{
  constructor(
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
  ) {}
  async execute(command: RemoveDevicesBannedUserCommand) {
    return await this.securityDevicesRawSqlRepository.removeDevicesBannedUser(
      command.userId,
    );
  }
}
