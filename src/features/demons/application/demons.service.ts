import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailsService } from '../../mails/application/mails.service';
import { BlacklistJwtRepository } from '../../auth/infrastructure/blacklist-jwt.repository';
import { CommandBus } from '@nestjs/cqrs';
import { AddSentEmailTimeCommand } from '../../mails/application/use-cases/add-sent-email-time.use-case';
import { RemoveEmailByIdCommand } from '../../mails/application/use-cases/remove-email-byId.use-case';
import { SendCodeByRegistrationCommand } from '../../mails/adapters/use-case/send-code-by-registration.use-case';

@Injectable()
export class DemonsService {
  constructor(
    private mailService: MailsService,
    private blacklistJwtRepository: BlacklistJwtRepository,
    private commandBus: CommandBus,
  ) {}
  @Cron('* * * * * *')
  async sendAndDeleteConfirmationCode() {
    const emailAndCode = await this.mailService.findEmailByOldestDate();
    if (emailAndCode) {
      await this.commandBus.execute(
        new RemoveEmailByIdCommand(emailAndCode.id),
      );
      await this.commandBus.execute(
        new SendCodeByRegistrationCommand(emailAndCode),
      );
      await this.commandBus.execute(
        new AddSentEmailTimeCommand(emailAndCode.email),
      );
    }
  }
  @Cron('0 */5 * * * *')
  async clearingInvalidJWTFromBlackList() {
    await this.blacklistJwtRepository.clearingInvalidJWTFromBlackList();
  }
}
