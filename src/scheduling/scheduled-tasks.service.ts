import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataCleanupService } from '../data-cleanup/data-cleanup.service';

@Injectable()
export class ScheduledTasksService {
  constructor(protected dataCleanupService: DataCleanupService) {}

  // every 30 min
  @Cron('*/30 * * * *')
  async removeInvalidJWTFromBlackList() {
    await this.dataCleanupService.removeInvalidJWTFromBlackList();
  }

  //  every 30 min
  @Cron('*/30 * * * *')
  async removeUserWithExpirationDate() {
    await this.dataCleanupService.removeDataUsersWithExpiredDate();
  }

  // every 30 min
  @Cron('*/30 * * * *')
  async removeDevicesWithExpiredDate() {
    await this.dataCleanupService.removeDevicesWithExpiredDate();
  }
}
