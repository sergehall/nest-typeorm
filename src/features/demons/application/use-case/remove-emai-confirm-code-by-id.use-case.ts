import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveEmailConfirmCodeByIdCommand {
  constructor(public codeId: string) {}
}
@CommandHandler(RemoveEmailConfirmCodeByIdCommand)
export class RemoveEmailConfirmCodeByIdUseCase
  implements ICommandHandler<RemoveEmailConfirmCodeByIdCommand>
{
  constructor(protected mailsRepository: MailsRawSqlRepository) {}
  async execute(command: RemoveEmailConfirmCodeByIdCommand): Promise<boolean> {
    return await this.mailsRepository.removeEmailConfirmCodesByCodeId(
      command.codeId,
    );
  }
}
