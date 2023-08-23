import { InsertResult, Repository } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SecurityDevicesEntity } from '../entities/session-devices.entity';

@Injectable()
export class SecurityDevicesRepo {
  constructor(
    @InjectRepository(SecurityDevicesEntity)
    private readonly securityDevicesRepository: Repository<SecurityDevicesEntity>,
  ) {}

  async createDevice(newDevice: SecurityDevicesEntity): Promise<boolean> {
    try {
      const queryBuilder = this.securityDevicesRepository
        .createQueryBuilder()
        .insert()
        .into(SecurityDevicesEntity)
        .values(newDevice)
        .returning(`"userId"`);

      const result: InsertResult = await queryBuilder.execute();
      return result.raw.length > 0;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new device.',
      );
    }
  }
}
