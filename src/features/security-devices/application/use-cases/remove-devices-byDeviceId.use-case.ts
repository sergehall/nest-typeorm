import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRawSqlRepository } from '../../infrastructure/security-devices-raw-sql.repository';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { forbiddenDeleteDevice } from '../../../../exception-filter/errors-messages';

export class RemoveDevicesByDeviceIdCommand {
  constructor(public deviceId: string, public currentPayload: PayloadDto) {}
}

@CommandHandler(RemoveDevicesByDeviceIdCommand)
export class RemoveDevicesByDeviceIdUseCase
  implements ICommandHandler<RemoveDevicesByDeviceIdCommand>
{
  constructor(
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
  ) {}

  async execute(command: RemoveDevicesByDeviceIdCommand): Promise<boolean> {
    const result =
      await this.securityDevicesRawSqlRepository.removeDeviceByDeviceId(
        command.deviceId,
        command.currentPayload,
      );
    if (result === '404') throw new NotFoundException();
    if (result === '403') {
      throw new HttpException(forbiddenDeleteDevice, HttpStatus.FORBIDDEN);
    }
    return result === '204';
  }
}
