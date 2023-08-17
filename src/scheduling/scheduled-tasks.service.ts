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

  // every 5th hour
  @Cron('0 */5 * * *')
  async removeUserWithExpirationDate() {
    await this.dataCleanupService.removeDataUsersWithExpiredDate();
  }

  // every 1 hour
  @Cron('0 */1 * * *')
  async removeDevicesWithExpiredDate() {
    await this.dataCleanupService.removeDevicesWithExpiredDate();
  }
}
