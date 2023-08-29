import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepo } from '../../infrastructure/security-devices.repo';

export class DeleteDevicesAfterLogoutCommand {
  constructor(public payload: PayloadDto) {}
}

@CommandHandler(DeleteDevicesAfterLogoutCommand)
export class DeleteDevicesAfterLogoutUseCase
  implements ICommandHandler<DeleteDevicesAfterLogoutCommand>
{
  constructor(protected securityDevicesRepo: SecurityDevicesRepo) {}

  async execute(command: DeleteDevicesAfterLogoutCommand): Promise<boolean> {
    return this.securityDevicesRepo.deleteDeviceOnLogout(command.payload);
  }
}
