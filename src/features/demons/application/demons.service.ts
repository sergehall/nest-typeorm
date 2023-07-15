import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailsService } from '../../mails/application/mails.service';
import { BlacklistJwtRepository } from '../../auth/infrastructure/blacklist-jwt.repository';
import { CommandBus } from '@nestjs/cqrs';
import { AddSentEmailTimeCommand } from '../../mails/application/use-cases/add-sent-email-time.use-case';
import { RemoveEmailByIdCommand } from '../../mails/application/use-cases/remove-email-byId.use-case';
import { SendCodeByRegistrationCommand } from '../../mails/adapters/use-case/send-code-by-registration.use-case';
import { EmailsConfirmCodeEntity } from '../entities/emailsConfirmCode.entity';

@Injectable()
export class DemonsService {
  constructor(
    private mailService: MailsService,
    private blacklistJwtRepository: BlacklistJwtRepository,
    private commandBus: CommandBus,
  ) {}
  @Cron('* * * * * *')
  async sendAndDeleteConfirmationCode() {
    const emailAndCode: EmailsConfirmCodeEntity[] =
      await this.mailService.findEmailByOldestDate();
    if (emailAndCode[0]) {
      await this.commandBus.execute(
        new RemoveEmailByIdCommand(emailAndCode[0].id),
      );
      await this.commandBus.execute(
        new SendCodeByRegistrationCommand(emailAndCode[0]),
      );
      await this.commandBus.execute(
        new AddSentEmailTimeCommand(emailAndCode[0].id, emailAndCode[0].email),
      );
    }
  }
  @Cron('0 */5 * * * *')
  async clearingInvalidJWTFromBlackList() {
    await this.blacklistJwtRepository.clearingInvalidJWTFromBlackList();
  }
}
