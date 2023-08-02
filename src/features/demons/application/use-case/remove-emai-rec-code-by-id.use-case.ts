import { MailsRawSqlRepository } from '../../../mails/infrastructure/mails-raw-sql.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveEmailRecoverCodeByIdCommand {
  constructor(public codeId: string) {}
}
@CommandHandler(RemoveEmailRecoverCodeByIdCommand)
export class RemoveEmailRecoverCodeByIdUseCase
  implements ICommandHandler<RemoveEmailRecoverCodeByIdCommand>
{
  constructor(protected mailsRepository: MailsRawSqlRepository) {}
  async execute(command: RemoveEmailRecoverCodeByIdCommand): Promise<boolean> {
    return await this.mailsRepository.removeEmailRecoverCodesByCodeId(
      command.codeId,
    );
  }
}
