import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailsRawSqlRepository } from '../../infrastructure/mails-raw-sql.repository';
import { SentEmailTableNames } from '../types/sent-email-table-names';

export class ClearSentEmailCodesCommand {
  constructor(public readonly tableNames: SentEmailTableNames[]) {}
}

@CommandHandler(ClearSentEmailCodesCommand)
export class ClearSentEmailCodesUseCase
  implements ICommandHandler<ClearSentEmailCodesCommand>
{
  constructor(private readonly mailsRawSqlRepository: MailsRawSqlRepository) {}

  async execute(command: ClearSentEmailCodesCommand): Promise<void> {
    const { tableNames } = command;

    for (const tableName of tableNames) {
      await this.mailsRawSqlRepository.clearSentEmailCodes(tableName);
    }
  }
}
