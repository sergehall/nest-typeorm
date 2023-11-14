import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDeviceViewModel } from '../../views/security-device.view-model';
import { SecurityDevicesRepo } from '../../infrastructure/security-devices.repo';

export class SearchDevicesCommand {
  constructor(public currentPayload: PayloadDto) {}
}

@CommandHandler(SearchDevicesCommand)
export class SearchDevicesUseCase
  implements ICommandHandler<SearchDevicesCommand>
{
  constructor(protected securityDevicesRepo: SecurityDevicesRepo) {}

  async execute(
    command: SearchDevicesCommand,
  ): Promise<SecurityDeviceViewModel[]> {
    return await this.securityDevicesRepo.findDevices(command.currentPayload);
  }
}
