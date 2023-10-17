import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
}
