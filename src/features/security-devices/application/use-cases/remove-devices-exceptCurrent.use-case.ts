import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRawSqlRepository } from '../../infrastructure/security-devices-raw-sql.repository';

export class RemoveDevicesExceptCurrentCommand {
  constructor(public currentPayload: PayloadDto) {}
}

@CommandHandler(RemoveDevicesExceptCurrentCommand)
export class RemoveDevicesExceptCurrentUseCase
  implements ICommandHandler<RemoveDevicesExceptCurrentCommand>
{
  constructor(
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
  ) {}

  async execute(command: RemoveDevicesExceptCurrentCommand): Promise<boolean> {
    return await this.securityDevicesRawSqlRepository.removeDevicesExceptCurrent(
      command.currentPayload,
    );
  }
}
