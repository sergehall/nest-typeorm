import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailsService } from '../../mails/application/mails.service';
import { CommandBus } from '@nestjs/cqrs';
import { BlacklistJwtRawSqlRepository } from '../../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../../security-devices/infrastructure/security-devices-raw-sql.repository';
import { UsersRawSqlRepository } from '../../users/infrastructure/users-raw-sql.repository';
import { RemoveDataUsersWithExpiredDateCommand } from './use-case/remove-data-users-with-expired-date.use-case';
import { MailsRawSqlRepository } from '../../mails/infrastructure/mails-raw-sql.repository';
import { FindAndSendConfirmationCommand } from '../../mails/application/use-cases/find-and-send-confirmation-code.use-case';
import { FindAndSendRecoveryCodeCommand } from '../../mails/application/use-cases/find-and-send-recovery-code.use-case';

@Injectable()
export class DemonsService {
  constructor(
    protected mailsService: MailsService,
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

  // // every sec
  // @Cron('* * * * * *')
  // async sendAndDeleteRecoveryCode() {
  //   const emailAndCode: EmailsRecoveryCodesEntity[] =
  //     await this.mailsService.findEmailRecCodeByOldestDate();
  //   if (emailAndCode.length > 0) {
  //     const { email, codeId } = emailAndCode[0];
  //
  //     await this.commandBus.execute(
  //       new RemoveEmailRecoverCodeByIdCommand(codeId),
  //     );
  //     await this.commandBus.execute(
  //       new SendRecoveryCodesCommand(emailAndCode[0]),
  //     );
  //     await this.commandBus.execute(new AddSentEmailTimeCommand(codeId, email));
  //   }
  // }

  // every 30 min
  @Cron('*/30 * * * *')
  async clearingInvalidJWTFromBlackList() {
    await this.blacklistJwtRawSqlRepository.clearingInvalidJWTFromBlackList();
  }

  // every 1 hour
  @Cron('0 * * * *')
  async clearingDevicesWithExpiredDate() {
    await this.securityDevicesRawSqlRepository.clearingDevicesWithExpiredDate();
  }

  // // // every 1 hour
  // // @Cron('0 * * * *')
  // // every sec
  // @Cron('* * * * * *')
  // async clearingSentEmails() {
  //   await this.mailsRawSqlRepository.clearingSentEmails();
  // }

  // every 30 min
  @Cron('*/30 * * * *')
  async clearingUserWithExpirationDate() {
    await this.commandBus.execute(new RemoveDataUsersWithExpiredDateCommand());
  }
}
