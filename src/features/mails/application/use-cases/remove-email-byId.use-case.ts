import { MailsRawSqlRepository } from '../../infrastructure/mails-raw-sql.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveEmailByIdCommand {
  constructor(public id: string) {}
}
@CommandHandler(RemoveEmailByIdCommand)
export class RemoveEmailByIdUseCase
  implements ICommandHandler<RemoveEmailByIdCommand>
{
  constructor(protected mailsRepository: MailsRawSqlRepository) {}
  async execute(command: RemoveEmailByIdCommand): Promise<boolean> {
    return await this.mailsRepository.removeEmailById(command.id);
  }
}
