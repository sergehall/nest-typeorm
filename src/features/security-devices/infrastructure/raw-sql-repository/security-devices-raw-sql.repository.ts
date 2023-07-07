import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FiltersDevicesEntity } from '../../entities/filters-devices.entity';
import { SessionDevicesEntity } from '../../entities/security-device.entity';
import { PayloadDto } from '../../../auth/dto/payload.dto';

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
    } catch (e) {
      console.log(e);
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
      WHERE "userId" = $1 and "deviceId" = $2
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
}
