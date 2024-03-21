import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SentCodesLogEntity } from '../entities/sent-codes-log.entity';
import { UsersEntity } from '../../../features/users/entities/users.entity';
import { InternalServerErrorException } from '@nestjs/common';

export class SentCodeLogRepo {
  constructor(
    @InjectRepository(SentCodesLogEntity)
    private readonly sentCodesLogRepository: Repository<SentCodesLogEntity>,
  ) {}

  async addTime(user: UsersEntity): Promise<SentCodesLogEntity> {
    const newLogEntry: SentCodesLogEntity = await this.createNewLogEntry(user);

    try {
      return await this.sentCodesLogRepository.save(newLogEntry);
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async createNewLogEntry(
    user: UsersEntity,
  ): Promise<SentCodesLogEntity> {
    const newLogEntry = new SentCodesLogEntity();
    newLogEntry.sentForUser = user;
    newLogEntry.sentCodeTime = new Date().toISOString();
    return newLogEntry;
  }
}
