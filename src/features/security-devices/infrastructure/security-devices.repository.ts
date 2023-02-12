import { Inject, Injectable } from '@nestjs/common';
import { FiltersDevicesEntity } from '../entities/filters-devices.entity';
import { SessionDevicesEntity } from '../entities/security-device.entity';
import { Model } from 'mongoose';
import { DevicesDocument } from './schemas/devices.schema';
import { ProvidersEnums } from '../../../infrastructure/database/enums/providers.enums';
import { PayloadDto } from '../../auth/dto/payload.dto';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @Inject(ProvidersEnums.DEVICES_MODEL)
    private MyModelDevicesModel: Model<DevicesDocument>,
  ) {}
  async createOrUpdateDevice(
    filter: FiltersDevicesEntity,
    newDevices: SessionDevicesEntity,
  ): Promise<boolean> {
    try {
      return await this.MyModelDevicesModel.findOneAndUpdate(
        filter,
        {
          $set: newDevices,
        },
        { upsert: true },
      ).lean();
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async removeDeviceByDeviceIdAfterLogout(
    payload: PayloadDto,
  ): Promise<boolean> {
    try {
      const result = await this.MyModelDevicesModel.deleteOne({
        $and: [{ userId: payload.userId }, { deviceId: payload.deviceId }],
      });
      return result.deletedCount === 1;
    } catch (e: any) {
      return e.toString();
    }
  }
  async findDevices(payload: PayloadDto): Promise<SessionDevicesEntity[]> {
    try {
      return await this.MyModelDevicesModel.find(
        {
          $and: [
            { userId: payload.userId },
            { expirationDate: { $gt: new Date().toISOString() } },
          ],
        },
        {
          _id: false,
          __v: false,
          userId: false,
          expirationDate: false,
        },
      );
    } catch (e) {
      console.log(e);
      return [];
    }
  }
  async removeDevicesExceptCurrent(payload: PayloadDto): Promise<boolean> {
    try {
      return await this.MyModelDevicesModel.deleteMany({
        $and: [
          { userId: payload.userId },
          { deviceId: { $ne: payload.deviceId } },
        ],
      }).lean();
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async removeDeviceByDeviceId(
    deviceId: string,
    payload: PayloadDto,
  ): Promise<string> {
    try {
      const findByDeviceId = await this.MyModelDevicesModel.findOne({
        deviceId: deviceId,
      }).lean();
      if (!findByDeviceId) {
        return '404';
      } else if (findByDeviceId && findByDeviceId.userId !== payload.userId) {
        return '403';
      }
      await this.MyModelDevicesModel.deleteOne({ deviceId: deviceId });
      return '204';
    } catch (e: any) {
      return e.toString();
    }
  }
  async removeDevicesBannedUser(userId: string) {
    const remove = await this.MyModelDevicesModel.deleteMany({
      userId: userId,
    });
    remove.acknowledged;
    return await this.MyModelDevicesModel.deleteMany({ userId: userId });
  }
}
