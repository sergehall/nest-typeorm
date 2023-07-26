import { MailsRawSqlRepository } from '../../infrastructure/mails-raw-sql.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DemonRemoveEmailRecoverCodeByIdCommand {
  constructor(public codeId: string) {}
}
@CommandHandler(DemonRemoveEmailRecoverCodeByIdCommand)
export class DemonRemoveEmailRecoverCodeByIdUseCase
  implements ICommandHandler<DemonRemoveEmailRecoverCodeByIdCommand>
{
  constructor(protected mailsRepository: MailsRawSqlRepository) {}
  async execute(
    command: DemonRemoveEmailRecoverCodeByIdCommand,
  ): Promise<boolean> {
    return await this.mailsRepository.removeEmailRecoverCodesByCodeId(
      command.codeId,
    );
  }
}
