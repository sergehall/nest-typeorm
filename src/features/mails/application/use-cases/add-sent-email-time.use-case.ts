import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SentEmailEmailsConfirmationCodeTimeRepository } from '../../infrastructure/sentEmailEmailsConfirmationCodeTime.repository';

export class AddSentEmailTimeCommand {
  constructor(public codeId: string, public email: string) {}
}

@CommandHandler(AddSentEmailTimeCommand)
export class AddSentEmailTimeUseCase
  implements ICommandHandler<AddSentEmailTimeCommand>
{
  constructor(
    protected sentEmailEmailsConfirmationCodeTimeRepository: SentEmailEmailsConfirmationCodeTimeRepository,
  ) {}
  async execute(command: AddSentEmailTimeCommand) {
    const currentTime = new Date().toISOString();
    return await this.sentEmailEmailsConfirmationCodeTimeRepository.addConfirmationCode(
      command.codeId,
      command.email,
      currentTime,
    );
  }
}
