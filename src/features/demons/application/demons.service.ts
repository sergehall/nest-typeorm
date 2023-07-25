import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailsService } from '../../mails/application/mails.service';
import { CommandBus } from '@nestjs/cqrs';
import { AddSentEmailTimeCommand } from '../../mails/application/use-cases/add-sent-email-time.use-case';
import { EmailsConfirmCodeEntity } from '../entities/emailsConfirmCode.entity';
import { BlacklistJwtRawSqlRepository } from '../../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from '../../security-devices/infrastructure/security-devices-raw-sql.repository';
import { UsersRawSqlRepository } from '../../users/infrastructure/users-raw-sql.repository';
import { EmailsRecoveryCodesEntity } from '../entities/emailsRecoveryCodes.entity';
import { RemoveEmailConfirmCodeByIdCommand } from '../../mails/application/use-cases/remove-emai-confCode-byId.use-case';
import { RemoveEmailRecoverCodeByIdCommand } from '../../mails/application/use-cases/remove-emai-recCode-byId.use-case';
import { SendRegistrationCodesCommand } from '../../mails/adapters/use-case/send-registrationCodes.use-case';
import { SendRecoveryCodesCommand } from '../../mails/adapters/use-case/send-recoveryCodes';
import { DemonDeleteDataUsersWithExpiredDateCommand } from './use-case/demon-delete-data-users-with-expired-date.use-case';

@Injectable()
export class DemonsService {
  constructor(
    protected mailService: MailsService,
    protected blacklistJwtRawSqlRepository: BlacklistJwtRawSqlRepository,
    protected securityDevicesRawSqlRepository: SecurityDevicesRawSqlRepository,
    protected usersRawSqlRepository: UsersRawSqlRepository,
    protected commandBus: CommandBus,
  ) {}
  // every sec
  @Cron('* * * * * *')
  async sendAndDeleteConfirmationCode() {
    const emailAndCode: EmailsConfirmCodeEntity[] =
      await this.mailService.findEmailConfCodeByOldestDate();

    if (emailAndCode.length > 0) {
      const { codeId, email } = emailAndCode[0];

      await this.commandBus.execute(
        new RemoveEmailConfirmCodeByIdCommand(codeId),
      );
      await this.commandBus.execute(
        new SendRegistrationCodesCommand(emailAndCode[0]),
      );
      await this.commandBus.execute(new AddSentEmailTimeCommand(codeId, email));
    }
  }

  // every sec
  @Cron('* * * * * *')
  async sendAndDeleteRecoveryCode() {
    const emailAndCode: EmailsRecoveryCodesEntity[] =
      await this.mailService.findEmailRecCodeByOldestDate();
    if (emailAndCode.length > 0) {
      const { email, codeId } = emailAndCode[0];

      await this.commandBus.execute(
        new RemoveEmailRecoverCodeByIdCommand(codeId),
      );
      await this.commandBus.execute(
        new SendRecoveryCodesCommand(emailAndCode[0]),
      );
      await this.commandBus.execute(new AddSentEmailTimeCommand(codeId, email));
    }
  }

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

  // every 1 min
  @Cron('0 */1 * * * *')
  async clearingUserWithExpirationDate() {
    await this.commandBus.execute(
      new DemonDeleteDataUsersWithExpiredDateCommand(),
    );
  }
}
