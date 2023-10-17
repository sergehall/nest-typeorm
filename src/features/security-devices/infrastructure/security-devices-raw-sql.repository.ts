import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TablesSessionDevicesEntity } from '../entities/tables-security-device.entity';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { SecurityDeviceViewModel } from '../view-models/security-device.view-model';

export class SecurityDevicesRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findDevices(payload: PayloadDto): Promise<SecurityDeviceViewModel[]> {
    try {
      const currentTime = new Date().toISOString();
      const limit = 1000;
      const offset = 0;
      return await this.db.query(
        `
        SELECT "ip", "title", "lastActiveDate", "deviceId"
        FROM public."SecurityDevices"
        WHERE "userId" = $1 AND "expirationDate" >= $2
        ORDER BY "lastActiveDate" DESC
        LIMIT $3 OFFSET $4
        `,
        [payload.userId, currentTime, limit, offset],
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeDeviceByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const isDeleted = await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "deviceId" = $1
      RETURNING *
      `,
        [deviceId],
      );
      return isDeleted[1] === 1;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findDeviceByDeviceId(
    deviceId: string,
  ): Promise<TablesSessionDevicesEntity[]> {
    try {
      const currentTime = new Date().toISOString();

      return await this.db.query(
        `
        SELECT "id", "deviceId", "ip", "title", "lastActiveDate", "expirationDate", "userId"
        FROM public."SecurityDevices"
        WHERE "deviceId" = $1 AND "expirationDate" >= $2
        `,
        [deviceId, currentTime],
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
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
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
