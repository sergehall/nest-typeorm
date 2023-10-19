import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataCleanupService } from '../data-cleanup/data-cleanup.service';

@Injectable()
export class ScheduledTasksService {
  constructor(protected dataCleanupService: DataCleanupService) {}

  // every 3 hours
  @Cron('0 */3 * * *')
  async clearingExpiredJwt() {
    await this.dataCleanupService.clearingExpiredJwt();
  }

  // every 4 hour
  @Cron('0 */4 * * *')
  async clearingExpiredUsersData() {
    await this.dataCleanupService.clearingExpiredUsersData();
  }

  // every 1 hour
  @Cron('0 */1 * * *')
  async clearingExpiredDevices() {
    await this.dataCleanupService.clearingExpiredDevices();
  }
}
