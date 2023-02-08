import { EmailConfimCodeEntity } from '../../entities/email-confim-code.entity';
import { MailsAdapter } from '../../adapters/mails.adapter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SentCodeByRegistrationCommand {
  constructor(public emailAndCode: EmailConfimCodeEntity) {}
}

@CommandHandler(SentCodeByRegistrationCommand)
export class SentCodeByRegistrationUseCase
  implements ICommandHandler<SentCodeByRegistrationCommand>
{
  constructor(private emailsAdapter: MailsAdapter) {}
  async execute(command: SentCodeByRegistrationCommand): Promise<void> {
    return await this.emailsAdapter.sendCodeByRegistration(
      command.emailAndCode,
    );
  }
}
