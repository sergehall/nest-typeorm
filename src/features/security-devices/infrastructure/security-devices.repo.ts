import { Repository } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SecurityDevicesEntity } from '../entities/session-devices.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import { PayloadDto } from '../../auth/dto/payload.dto';

@Injectable()
export class SecurityDevicesRepo {
  constructor(
    @InjectRepository(SecurityDevicesEntity)
    private readonly securityDevicesRepository: Repository<SecurityDevicesEntity>,
  ) {}

  async createDevice(
    newPayload: PayloadDto,
    clientIp: string,
    userAgent: string,
  ): Promise<SecurityDevicesEntity> {
    const newDeviceEntity = await this.createSecurityDevice(
      newPayload,
      clientIp,
      userAgent,
    );
    try {
      return await this.securityDevicesRepository.save(newDeviceEntity);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new device.',
      );
    }
  }

  private async createSecurityDevice(
    newPayload: PayloadDto,
    clientIp: string,
    userAgent: string,
  ): Promise<SecurityDevicesEntity> {
    const user = new UsersEntity();
    user.userId = newPayload.userId;
    console.log(newPayload, 'newPayload');
    console.log(clientIp, 'clientIp');
    console.log(userAgent, 'userAgent');
    const newDevice: SecurityDevicesEntity = new SecurityDevicesEntity();
    newDevice.id = uuid4();
    newDevice.deviceId = newPayload.deviceId;
    newDevice.ip = clientIp;
    newDevice.title = userAgent;
    newDevice.lastActiveDate = new Date(newPayload.iat * 1000).toISOString();
    newDevice.expirationDate = new Date(newPayload.exp * 1000).toISOString();
    newDevice.user = user;

    return newDevice;
  }
}
