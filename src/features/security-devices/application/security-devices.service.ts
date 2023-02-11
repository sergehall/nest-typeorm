import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from '../infrastructure/security-devices.repository';
import { PayloadDto } from '../../auth/dto/payload.dto';

@Injectable()
export class SecurityDevicesService {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async findDevices(currentPayload: PayloadDto) {
    return await this.securityDevicesRepository.findDevices(currentPayload);
  }
}
