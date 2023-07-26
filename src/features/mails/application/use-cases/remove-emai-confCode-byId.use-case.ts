import { MailsRawSqlRepository } from '../../infrastructure/mails-raw-sql.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DemonRemoveEmailConfirmCodeByIdCommand {
  constructor(public codeId: string) {}
}
@CommandHandler(DemonRemoveEmailConfirmCodeByIdCommand)
export class DemonRemoveEmailConfirmCodeByIdUseCase
  implements ICommandHandler<DemonRemoveEmailConfirmCodeByIdCommand>
{
  constructor(protected mailsRepository: MailsRawSqlRepository) {}
  async execute(
    command: DemonRemoveEmailConfirmCodeByIdCommand,
  ): Promise<boolean> {
    return await this.mailsRepository.removeEmailConfirmCodesByCodeId(
      command.codeId,
    );
  }
}
