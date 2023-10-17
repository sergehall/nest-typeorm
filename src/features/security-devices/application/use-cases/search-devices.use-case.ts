import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRawSqlRepository } from '../../infrastructure/security-devices-raw-sql.repository';
import { SecurityDeviceViewModel } from '../../view-models/security-device.view-model';

export class SearchDevicesCommand {
  constructor(public currentPayload: PayloadDto) {}
}

@CommandHandler(SearchDevicesCommand)
export class SearchDevicesUseCase
  implements ICommandHandler<SearchDevicesCommand>
{
  constructor(
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
  ) {}

  async execute(
    command: SearchDevicesCommand,
  ): Promise<SecurityDeviceViewModel[]> {
    return await this.securityDevicesRawSqlRepository.findDevices(
      command.currentPayload,
    );
  }
}
