import { Injectable } from '@nestjs/common';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { SecurityDevicesRawSqlRepository } from '../infrastructure/security-devices-raw-sql.repository';
import { SessionDevicesEntity } from '../entities/security-device.entity';

@Injectable()
export class SecurityDevicesService {
  constructor(
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
  ) {}

  async findDevices(
    currentPayload: PayloadDto,
  ): Promise<SessionDevicesEntity[]> {
    return await this.securityDevicesRawSqlRepository.findDevices(
      currentPayload,
    );
  }
}
