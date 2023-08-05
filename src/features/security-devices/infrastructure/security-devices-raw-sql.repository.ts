import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionDevicesEntity } from '../entities/security-device.entity';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { ReturnSecurityDeviceEntity } from '../entities/return-security-device.entity';

export class SecurityDevicesRawSqlRepository {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async createOrUpdateDevice(
    newDevices: SessionDevicesEntity,
  ): Promise<boolean> {
    try {
      const createOrUpdateDevice = await this.db.query(
        `
      INSERT INTO public."SecurityDevices"
      ("userId",
       "deviceId",
       "ip",
       "title",
       "lastActiveDate",
       "expirationDate"
       )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT ( "userId", "deviceId" )
      DO UPDATE SET "userId" = $1, "deviceId" = $2, "ip" = $3, "title" = $4, "lastActiveDate" = $5, "expirationDate" = $6
      RETURNING "userId"
      `,
        [
          newDevices.userId,
          newDevices.deviceId,
          newDevices.ip,
          newDevices.title,
          newDevices.lastActiveDate,
          newDevices.expirationDate,
        ],
      );
      return createOrUpdateDevice[0] != null;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findDevices(
    payload: PayloadDto,
  ): Promise<ReturnSecurityDeviceEntity[]> {
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

  async removeDeviceByDeviceIdAfterLogout(
    payload: PayloadDto,
  ): Promise<boolean> {
    try {
      const removeCurrentDevice = await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "userId" = $1 AND "deviceId" = $2
      RETURNING "userId"
      `,
        [payload.userId, payload.deviceId],
      );
      return removeCurrentDevice[0] != null;
    } catch (error) {
      console.log(error);
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
  ): Promise<SessionDevicesEntity[]> {
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

  async clearingDevicesWithExpiredDate() {
    try {
      const currentTime = new Date().toISOString();
      return await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "expirationDate" <= $1
      `,
        [currentTime],
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeDevicesBannedUser(userId: string) {
    try {
      const removeCurrentDevices = await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "userId" = $1
      RETURNING "userId"
      `,
        [userId],
      );
      return removeCurrentDevices[0] != null;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeDevicesByUseId(userId: string) {
    try {
      return await this.db.query(
        `
      DELETE FROM public."SecurityDevices"
      WHERE "userId" = $1
      `,
        [userId],
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
