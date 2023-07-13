import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRawSqlRepository } from '../../infrastructure/security-devices-raw-sql.repository';

export class RemoveDevicesAfterLogoutCommand {
  constructor(public payload: PayloadDto) {}
}

@CommandHandler(RemoveDevicesAfterLogoutCommand)
export class RemoveDevicesAfterLogoutUseCase
  implements ICommandHandler<RemoveDevicesAfterLogoutCommand>
{
  constructor(
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
  ) {}

  async execute(command: RemoveDevicesAfterLogoutCommand): Promise<boolean> {
    return this.securityDevicesRawSqlRepository.removeDeviceByDeviceIdAfterLogout(
      command.payload,
    );
  }
}
