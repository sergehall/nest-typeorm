import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SentEmailsTimeConfirmAndRecoverCodesRepository } from '../../infrastructure/sentEmailEmailsConfirmationCodeTime.repository';

export class AddSentEmailTimeCommand {
  constructor(public codeId: string, public email: string) {}
}

@CommandHandler(AddSentEmailTimeCommand)
export class AddSentEmailTimeUseCase
  implements ICommandHandler<AddSentEmailTimeCommand>
{
  constructor(
    protected sentEmailsTimeConfirmAndRecoverCodesRepository: SentEmailsTimeConfirmAndRecoverCodesRepository,
  ) {}
  async execute(command: AddSentEmailTimeCommand) {
    const { codeId, email } = command;
    const currentTime = new Date().toISOString();

    return await this.sentEmailsTimeConfirmAndRecoverCodesRepository.addConfirmationCode(
      codeId,
      email,
      currentTime,
    );
  }
}
