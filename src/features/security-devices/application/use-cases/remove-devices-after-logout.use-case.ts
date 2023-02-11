import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveDevicesAfterLogoutCommand {
  constructor(public payload: PayloadDto) {}
}

@CommandHandler(RemoveDevicesAfterLogoutCommand)
export class RemoveDevicesAfterLogoutUseCase
  implements ICommandHandler<RemoveDevicesAfterLogoutCommand>
{
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(command: RemoveDevicesAfterLogoutCommand): Promise<boolean> {
    return this.securityDevicesRepository.removeDeviceByDeviceIdAfterLogout(
      command.payload,
    );
  }
}
