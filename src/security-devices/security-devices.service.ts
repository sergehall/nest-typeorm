import { Injectable } from '@nestjs/common';
import { SessionDevicesEntity } from './entities/security-device.entity';
import { SecurityDevicesRepository } from './infrastructure/security-devices.repository';
import { PayloadDto } from '../auth/dto/payload.dto';

@Injectable()
export class SecurityDevicesService {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}
  async createDevices(
    newPayload: PayloadDto,
    clientIp: string,
    userAgent: string,
  ): Promise<boolean> {
    const filter = { userId: newPayload.userId, deviceId: newPayload.deviceId };
    const newDevices: SessionDevicesEntity = {
      userId: newPayload.userId,
      ip: clientIp,
      title: userAgent,
      lastActiveDate: new Date(newPayload.iat * 1000).toISOString(),
      expirationDate: new Date(newPayload.exp * 1000).toISOString(),
      deviceId: newPayload.deviceId,
    };
    return await this.securityDevicesRepository.createOrUpdateDevices(
      filter,
      newDevices,
    );
  }

  async deleteDeviceByDeviceIdAfterLogout(
    payload: PayloadDto,
  ): Promise<boolean> {
    return this.securityDevicesRepository.deleteDeviceByDeviceIdAfterLogout(
      payload,
    );
  }

  async findDevices(currentPayload: PayloadDto) {
    return await this.securityDevicesRepository.findDevices(currentPayload);
  }
  async removeDevicesExceptCurrent(currentPayload: PayloadDto) {
    return await this.securityDevicesRepository.removeDevicesExceptCurrent(
      currentPayload,
    );
  }
  async removeDeviceByDeviceId(deviceId: string, currentPayload: PayloadDto) {
    return await this.securityDevicesRepository.removeDeviceByDeviceId(
      deviceId,
      currentPayload,
    );
  }
  async removeDevicesBannedUser(userId: string) {
    return await this.securityDevicesRepository.removeDevicesBannedUser(userId);
  }
}
