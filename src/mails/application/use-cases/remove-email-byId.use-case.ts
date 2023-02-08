import { MailsRepository } from '../../infrastructure/mails.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RemoveEmailByIdCommand {
  constructor(public id: string) {}
}
@CommandHandler(RemoveEmailByIdCommand)
export class RemoveEmailByIdUseCase
  implements ICommandHandler<RemoveEmailByIdCommand>
{
  constructor(protected mailsRepository: MailsRepository) {}
  async execute(command: RemoveEmailByIdCommand): Promise<boolean> {
    return await this.mailsRepository.removeEmailById(command.id);
  }
}
