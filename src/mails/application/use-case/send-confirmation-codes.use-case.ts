import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailSendingCommand } from './email-sending-use-case';
import { SentCodeLogRepository } from '../../infrastructure/sent-code-log.repository';
import { ConfirmationCodeEmailOptions } from '../dto/confirmation-code-email-options';
import { MailOptionsBuilder } from '../../mail-options/mail-options-builder';

export class SendConfirmationCodesCommand {
  constructor(public email: string, public confirmationCode: string) {}
}

@CommandHandler(SendConfirmationCodesCommand)
export class SendConfirmationCodesUseCase
  implements ICommandHandler<SendConfirmationCodesCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected mailOptionsBuilder: MailOptionsBuilder,
    protected sentCodeLogRepository: SentCodeLogRepository,
  ) {}

  async execute(command: SendConfirmationCodesCommand): Promise<void> {
    const { email, confirmationCode } = command;

    const mailOptions: ConfirmationCodeEmailOptions =
      await this.mailOptionsBuilder.buildOptionsForConfirmationCode(
        email,
        confirmationCode,
      );

    await this.commandBus.execute(new EmailSendingCommand(mailOptions));

    await this.sentCodeLogRepository.addTime(email);
  }
}
