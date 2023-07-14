import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FiltersDevicesEntity } from '../entities/filters-devices.entity';
import { SessionDevicesEntity } from '../entities/security-device.entity';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { ReturnSecurityDeviceEntity } from '../entities/return-security-device.entity';

export class SecurityDevicesRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  async createOrUpdateDevice(
    filter: FiltersDevicesEntity,
    newDevices: SessionDevicesEntity,
  ): Promise<boolean> {
    try {
      const createOrUpdateDevice = await this.db.query(
        `
      INSERT INTO public."SecurityDevices"
      ("userId",
       "ip", 
       "title", 
       "lastActiveDate", 
       "expirationDate", 
       "deviceId")
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT ( "userId", "deviceId" ) 
      DO UPDATE SET "userId" = $1, "ip" = $2, "title" = $3, "lastActiveDate" = $4, "expirationDate" = $5, "deviceId" = $6
      returning "userId"
      `,
        [
          filter.userId,
          newDevices.ip,
          newDevices.title,
          newDevices.lastActiveDate,
          newDevices.expirationDate,
          filter.deviceId,
        ],
      );
      return createOrUpdateDevice[0] != null;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
  async removeDeviceByDeviceIdAfterLogout(
    payload: PayloadDto,
  ): Promise<boolean> {
    try {
      const removeCurrentDevice = await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "userId" = $1 AND "deviceId" = $2
      returning "userId"
      `,
        [payload.userId, payload.deviceId],
      );
      return removeCurrentDevice[0] != null;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async removeDeviceByDeviceId(
    deviceId: string,
    currentPayload: PayloadDto,
  ): Promise<string> {
    try {
      const findDevice = await this.findDeviceByDeviceId(deviceId);
      if (findDevice.length == 0) {
        return '404';
      } else if (findDevice[0].userId !== currentPayload.userId) {
        return '403';
      }
      const removeDeviceByDeviceId = await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "deviceId" = $1
      returning "deviceId"
      `,
        [deviceId],
      );
      return removeDeviceByDeviceId[1] === 1 ? '204' : '500';
    } catch (e) {
      console.log(e);
      return '500';
    }
  }
  async findDeviceByDeviceId(
    deviceId: string,
  ): Promise<SessionDevicesEntity[]> {
    try {
      const expirationDate = new Date().toISOString();
      return await this.db.query(
        `
        SELECT "userId", "ip", "title", "lastActiveDate", "expirationDate", "deviceId"
        FROM public."SecurityDevices"
        WHERE "deviceId" = $1 AND "expirationDate" >= $2
        `,
        [deviceId, expirationDate],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeDevicesBannedUser(userId: string) {
    try {
      const removeCurrentDevice = await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "userId" = $1
      returning "userId"
      `,
        [userId],
      );
      return removeCurrentDevice[0] != null;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async removeDevicesExceptCurrent(currentPayload: PayloadDto) {
    try {
      return await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "userId" = $1 AND "deviceId" <> $2
      `,
        [currentPayload.userId, currentPayload.deviceId],
      );
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async findDevices(
    payload: PayloadDto,
  ): Promise<ReturnSecurityDeviceEntity[]> {
    try {
      const expirationDate = new Date().toISOString();
      const limit = 100;
      const offset = 0;
      return await this.db.query(
        `
        SELECT "ip", "title", "lastActiveDate", "deviceId"
        FROM public."SecurityDevices"
        WHERE "userId" = $1 AND "expirationDate" >= $2
        ORDER BY "lastActiveDate" DESC
        LIMIT $3 OFFSET $4
        `,
        [payload.userId, expirationDate, limit, offset],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
