import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MailsService } from '../application/mails.service';
import { RegistrationUserEvent } from '../../../features/users/events/registration-user.event';

@EventsHandler(RegistrationUserEvent)
export class SendConfirmationCodeWhenRegistrationUserEventHandler
  implements IEventHandler<RegistrationUserEvent>
{
  constructor(protected mailsService: MailsService) {}

  async handle(event: RegistrationUserEvent): Promise<boolean> {
    const { userEntity } = event;
    return await this.mailsService.sendConfirmationCode(userEntity);
  }
}
