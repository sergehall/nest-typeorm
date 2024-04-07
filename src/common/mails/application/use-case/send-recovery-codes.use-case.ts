import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailSendingCommand } from './email-sending-use-case';
import { ConfirmationCodeEmailOptions } from '../dto/confirmation-code-email-options';
import { MailOptionsBuilder } from '../../mail-options/mail-options-builder';
import { UsersEntity } from '../../../../features/users/entities/users.entity';
import { SentCodeLogRepo } from '../../infrastructure/sent-code-log.repo';

export class SendRecoveryCodesCommand {
  constructor(public user: UsersEntity) {}
}

@CommandHandler(SendRecoveryCodesCommand)
export class SendRecoveryCodesUseCase
  implements ICommandHandler<SendRecoveryCodesCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected mailOptionsBuilder: MailOptionsBuilder,
    protected sentCodeLogRepo: SentCodeLogRepo,
  ) {}

  async execute(command: SendRecoveryCodesCommand): Promise<boolean> {
    const { user } = command;

    const mailOptions: ConfirmationCodeEmailOptions =
      await this.mailOptionsBuilder.buildOptionsForRecoveryCode(user);

    await this.commandBus.execute(new EmailSendingCommand(mailOptions));

    await this.sentCodeLogRepo.addTime(user);
    return true;
  }
}
