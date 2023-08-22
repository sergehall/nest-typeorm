import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRawSqlRepository } from '../../infrastructure/security-devices-raw-sql.repository';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { TablesSessionDevicesEntity } from '../../entities/tables-security-device.entity';
import { forbiddenDeleteDevice } from '../../../../common/filters/custom-errors-messages';

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
    const { deviceId, currentPayload } = command;
    const device: TablesSessionDevicesEntity[] =
      await this.securityDevicesRawSqlRepository.findDeviceByDeviceId(deviceId);

    if (device.length === 0) {
      throw new NotFoundException('Device not found');
    }

    if (device[0].userId !== currentPayload.userId) {
      throw new HttpException(forbiddenDeleteDevice, HttpStatus.FORBIDDEN);
    }

    return await this.securityDevicesRawSqlRepository.removeDeviceByDeviceId(
      deviceId,
    );
  }
}
