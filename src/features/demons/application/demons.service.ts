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
    if (emailAndCode[0]) {
      await this.commandBus.execute(
        new RemoveEmailConfirmCodeByIdCommand(emailAndCode[0].codeId),
      );
      await this.commandBus.execute(
        new SendRegistrationCodesCommand(emailAndCode[0]),
      );
      await this.commandBus.execute(
        new AddSentEmailTimeCommand(
          emailAndCode[0].codeId,
          emailAndCode[0].email,
        ),
      );
    }
  }
  // every sec
  @Cron('* * * * * *')
  async sendAndDeleteRecoveryCode() {
    const emailAndCode: EmailsRecoveryCodesEntity[] =
      await this.mailService.findEmailRecCodeByOldestDate();
    if (emailAndCode[0]) {
      await this.commandBus.execute(
        new RemoveEmailRecoverCodeByIdCommand(emailAndCode[0].codeId),
      );
      await this.commandBus.execute(
        new SendRecoveryCodesCommand(emailAndCode[0]),
      );
      await this.commandBus.execute(
        new AddSentEmailTimeCommand(
          emailAndCode[0].codeId,
          emailAndCode[0].email,
        ),
      );
    }
  }
  // every 5 min
  @Cron('0 */5 * * * *')
  async clearingInvalidJWTFromBlackList() {
    await this.blacklistJwtRawSqlRepository.clearingInvalidJWTFromBlackList();
  }
  // every 1 min
  @Cron('0 */1 * * * *')
  async clearingDevicesWithExpiredDate() {
    await this.securityDevicesRawSqlRepository.clearingDevicesWithExpiredDate();
  }
  // every 1 min
  @Cron('0 */1 * * * *')
  async clearingUserWithExpirationDate() {
    await this.usersRawSqlRepository.clearingUserWithExpirationDate();
  }
}
