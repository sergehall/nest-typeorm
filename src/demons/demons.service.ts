import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailsService } from '../mails/mails.service';
import { UsersService } from '../users/users.service';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';

@Injectable()
export class DemonsService {
  constructor(
    private mailService: MailsService,
    private usersService: UsersService,
    private blacklistJwtRepository: BlacklistJwtRepository,
  ) {}
  @Cron('* * * * * *')
  async sendAndDeleteConfirmationCode() {
    const emailAndCode = await this.mailService.findEmailByOldestDate();
    if (emailAndCode) {
      await this.mailService.sendCodeByRegistration(emailAndCode);
      console.log(`send confirmation code to email:  ${emailAndCode.email}`);
      await this.usersService.addSentEmailTime(emailAndCode.email);
      await this.mailService.removeEmailById(emailAndCode.id);
    }
  }
  @Cron('0 */5 * * * *')
  async clearingInvalidJWTFromBlackList() {
    await this.blacklistJwtRepository.clearingInvalidJWTFromBlackList();
  }
}
