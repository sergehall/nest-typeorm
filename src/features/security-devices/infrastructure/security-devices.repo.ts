import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SecurityDevicesEntity } from '../entities/session-devices.entity';
import { PayloadDto } from '../../auth/dto/payload.dto';
import { UuidErrorResolver } from '../../../common/helpers/uuid-error-resolver';
import { SecurityDeviceViewModel } from '../views/security-device.view-model';

@Injectable()
export class SecurityDevicesRepo {
  constructor(
    @InjectRepository(SecurityDevicesEntity)
    private readonly securityDevicesRepository: Repository<SecurityDevicesEntity>,
    protected uuidErrorResolver: UuidErrorResolver,
  ) {}

  async findDeviceByDeviceId(
    deviceId: string,
  ): Promise<SecurityDevicesEntity[]> {
    try {
      const currentTime = new Date().toISOString();

      return await this.securityDevicesRepository.find({
        where: {
          deviceId,
          expirationDate: MoreThanOrEqual(currentTime),
        },
      });
    } catch (error) {
      if (await this.uuidErrorResolver.isInvalidUUIDError(error)) {
        const deviceId =
          await this.uuidErrorResolver.extractUserIdFromError(error);
        throw new NotFoundException(
          `SecurityDevicesEntity with ID ${deviceId} not found`,
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findDevices(payload: PayloadDto): Promise<SecurityDeviceViewModel[]> {
    try {
      const currentTime = new Date().toISOString();
      const limit = 1000;
      const offset = 0;

      return await this.securityDevicesRepository
        .createQueryBuilder('device')
        .select([
          'device.ip',
          'device.title',
          'device.lastActiveDate',
          'device.deviceId',
        ])
        .where('device.userId = :userId', { userId: payload.userId })
        .andWhere('device.expirationDate >= :currentTime', { currentTime })
        .orderBy('device.lastActiveDate', 'DESC')
        .skip(offset)
        .take(limit)
        .getRawMany();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createDevice(
    newPayload: PayloadDto,
    clientIp: string,
    userAgent: string,
  ): Promise<SecurityDevicesEntity> {
    const newDeviceEntity = SecurityDevicesEntity.createSecurityDevicesEntity(
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

  async updateDevice(
    updatedPayload: PayloadDto,
    clientIp: string,
    userAgent: string,
  ): Promise<SecurityDevicesEntity | null> {
    try {
      const sessionToUpdate = await this.securityDevicesRepository.findOneBy({
        deviceId: updatedPayload.deviceId,
      });

      if (!sessionToUpdate) {
        return null;
      }

      sessionToUpdate.ip = clientIp;
      sessionToUpdate.title = userAgent;
      sessionToUpdate.lastActiveDate = new Date(
        updatedPayload.iat * 1000,
      ).toISOString();
      sessionToUpdate.expirationDate = new Date(
        updatedPayload.exp * 1000,
      ).toISOString();

      return await this.securityDevicesRepository.save(sessionToUpdate);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new device.',
      );
    }
  }

  async clearingExpiredDevices(): Promise<void> {
    try {
      const currentTime = new Date().toISOString();
      await this.securityDevicesRepository.delete({
        expirationDate: LessThan(currentTime),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteDeviceOnLogout(payload: PayloadDto): Promise<boolean> {
    const { userId, deviceId } = payload;

    try {
      const deleteDevice = await this.securityDevicesRepository.delete({
        deviceId: deviceId,
        user: { userId },
      });
      if (deleteDevice && deleteDevice.affected) {
        return deleteDevice.affected > 0;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteDeviceByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const deleteResult = await this.securityDevicesRepository.delete({
        deviceId,
      });

      // Check if any records were deleted (affected > 0)
      if (deleteResult && deleteResult.affected) {
        return deleteResult.affected > 0;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteDevicesExceptCurrent(
    currentPayload: PayloadDto,
  ): Promise<boolean> {
    try {
      const deleteResult = await this.securityDevicesRepository
        .createQueryBuilder()
        .delete()
        .where('"userId" = :userId', { userId: currentPayload.userId })
        .andWhere('"deviceId" <> :deviceId', {
          deviceId: currentPayload.deviceId,
        })
        .execute();

      // Check if any records were deleted (affected > 0)
      if (deleteResult && deleteResult.affected) {
        return deleteResult.affected > 0;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
