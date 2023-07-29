import { PayloadDto } from '../../../auth/dto/payload.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRawSqlRepository } from '../../infrastructure/security-devices-raw-sql.repository';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { forbiddenDeleteDevice } from '../../../../exception-filter/errors-messages';
import { SessionDevicesEntity } from '../../entities/security-device.entity';

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
    const device: SessionDevicesEntity[] =
      await this.securityDevicesRawSqlRepository.findDeviceByDeviceId(deviceId);

    console.log(device, 'device');
    if (device.length === 0) {
      throw new NotFoundException('Device not found');
    }

    if (device[0].userId !== currentPayload.userId) {
      throw new HttpException(forbiddenDeleteDevice, HttpStatus.FORBIDDEN);
    }

    const deleteResult =
      await this.securityDevicesRawSqlRepository.removeDeviceByDeviceId(
        deviceId,
      );

    return deleteResult.length != 0;
  }
}
