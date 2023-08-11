import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { BlacklistJwtRawSqlRepository } from '../../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../../security-devices/infrastructure/security-devices-raw-sql.repository';
import { UsersRawSqlRepository } from '../../users/infrastructure/users-raw-sql.repository';
import { RemoveDataUsersWithExpiredDateCommand } from './use-case/remove-data-users-with-expired-date.use-case';
import { MailsRawSqlRepository } from '../../mails/infrastructure/mails-raw-sql.repository';
import { FindAndSendConfirmationCommand } from '../../mails/application/use-case/find-and-send-confirmation-code.use-case';
import { FindAndSendRecoveryCodeCommand } from '../../mails/application/use-case/find-and-send-recovery-code.use-case';

@Injectable()
export class DemonsService {
  constructor(
    protected blacklistJwtRawSqlRepository: BlacklistJwtRawSqlRepository,
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected mailsRawSqlRepository: MailsRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}

  // every sec
  @Cron('* * * * * *')
  async sendCurrentConfirmationCodes() {
    await this.commandBus.execute(new FindAndSendConfirmationCommand());
  }

  // every sec
  @Cron('* * * * * *')
  async sendCurrentRecoveryCodes() {
    await this.commandBus.execute(new FindAndSendRecoveryCodeCommand());
  }

  // every 30 min
  @Cron('*/30 * * * *')
  async clearingInvalidJWTFromBlackList() {
    await this.blacklistJwtRawSqlRepository.clearingInvalidJWTFromBlackList();
  }

  // every 30 min
  @Cron('*/30 * * * *')
  async clearingUserWithExpirationDate() {
    await this.commandBus.execute(new RemoveDataUsersWithExpiredDateCommand());
  }

  // every 30 min
  @Cron('*/30 * * * *')
  async clearingSentEmails() {
    await this.mailsRawSqlRepository.clearingSentEmails();
  }

  // every 1 hour
  @Cron('0 * * * *')
  async clearingDevicesWithExpiredDate() {
    await this.securityDevicesRawSqlRepository.clearingDevicesWithExpiredDate();
  }
}
