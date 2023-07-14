import { Injectable } from '@nestjs/common';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { SecurityDevicesRawSqlRepository } from '../infrastructure/security-devices-raw-sql.repository';

@Injectable()
export class SecurityDevicesService {
  constructor(
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
  ) {}

  async findDevices(currentPayload: PayloadDto) {
    return await this.securityDevicesRawSqlRepository.findDevices(
      currentPayload,
    );
  }
}
