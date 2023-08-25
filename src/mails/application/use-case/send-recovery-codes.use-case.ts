import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailSendingCommand } from './email-sending-use-case';
import { SentCodeLogRepository } from '../../infrastructure/sent-code-log.repository';
import { ConfirmationCodeEmailOptions } from '../dto/confirmation-code-email-options';
import { MailOptionsBuilder } from '../../mail-options/mail-options-builder';
import { UsersEntity } from '../../../features/users/entities/users.entity';

export class SendRecoveryCodesCommand {
  constructor(public updatedUser: UsersEntity) {}
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

  async execute(command: SendRecoveryCodesCommand): Promise<boolean> {
    const { updatedUser } = command;
    const { email, confirmationCode } = updatedUser;

    const mailOptions: ConfirmationCodeEmailOptions =
      await this.mailOptionsBuilder.buildOptionsForRecoveryCode(
        email,
        confirmationCode,
      );

    await this.commandBus.execute(new EmailSendingCommand(mailOptions));

    await this.sentCodeLogRepository.addTime(updatedUser);
    return true;
  }
}
