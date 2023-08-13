import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailSendingCommand } from './email-sending-use-case';
import { SentCodeLogRepository } from '../../infrastructure/sent-code-log.repository';
import { ConfirmationCodeEmailOptions } from '../dto/confirmation-code-email-options';
import { MailOptionsBuilder } from '../../mail-options/mail-options-builder';

export class SendRecoveryCodesCommand {
  constructor(public email: string, public recoveryCode: string) {}
}

@CommandHandler(SendRecoveryCodesCommand)
export class SendRecoveryCodesUseCase
  implements ICommandHandler<SendRecoveryCodesCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected mailOptionsBuilder: MailOptionsBuilder,
    protected sentCodeLogRepository: SentCodeLogRepository,
  ) {}

  async execute(command: SendRecoveryCodesCommand): Promise<void> {
    const { email, recoveryCode } = command;

    const mailOptions: ConfirmationCodeEmailOptions =
      await this.mailOptionsBuilder.buildOptionsForRecoveryCode(
        email,
        recoveryCode,
      );

    await this.commandBus.execute(new EmailSendingCommand(mailOptions));

    await this.sentCodeLogRepository.addTime(email);
  }
}
