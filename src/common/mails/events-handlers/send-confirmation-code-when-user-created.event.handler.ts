import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CreateUserEvent } from '../../../features/users/events/create-user.event';
import { MailsService } from '../application/mails.service';

@EventsHandler(CreateUserEvent)
export class SendConfirmationCodeWhenUserCreatedEventHandler
  implements IEventHandler<CreateUserEvent>
{
  constructor(protected mailsService: MailsService) {}

  async handle(event: CreateUserEvent): Promise<boolean> {
    return await this.mailsService.sendConfirmationCode(event.userEntity);
  }
}
