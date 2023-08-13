import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataCleanupService } from '../data-cleanup/data-cleanup.service';
import { MailsService } from '../mails/application/mails.service';

@Injectable()
export class ScheduledTasksService {
  constructor(
    protected dataCleanupService: DataCleanupService,
    protected mailsService: MailsService,
  ) {}

  // every sec
  @Cron('* * * * * *')
  async sendCurrentRecoveryCodes() {
    await this.mailsService.sendCurrentRecoveryCodes();
  }

  // every 30 min
  @Cron('*/30 * * * *')
  async removeInvalidJWTFromBlackList() {
    await this.dataCleanupService.removeInvalidJWTFromBlackList();
  }

  // // every 30 min
  @Cron('*/30 * * * *')
  async removeUserWithExpirationDate() {
    await this.dataCleanupService.removeDataUsersWithExpiredDate();
  }

  // every 30 min
  @Cron('*/30 * * * *')
  async removeSentEmails() {
    await this.dataCleanupService.removeSentEmailCodes();
  }

  // every 30 min
  @Cron('*/30 * * * *')
  async removeDevicesWithExpiredDate() {
    await this.dataCleanupService.removeDevicesWithExpiredDate();
  }
}
