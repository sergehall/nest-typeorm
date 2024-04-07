import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MailsService } from '../application/mails.service';
import { UpdatedConfirmationCodeEvent } from '../../../features/auth/events/updated-confirmation-code.event';

@EventsHandler(UpdatedConfirmationCodeEvent)
export class ReSendConfirmationCodeEventHandler
  implements IEventHandler<UpdatedConfirmationCodeEvent>
{
  constructor(protected mailsService: MailsService) {}

  async handle(event: UpdatedConfirmationCodeEvent): Promise<boolean> {
    const { userEntity } = event;
    return await this.mailsService.sendConfirmationCode(userEntity);
  }
}
