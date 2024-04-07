import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MailsService } from '../application/mails.service';
import { UpdatedConfirmationCodeByRecoveryCodeEvent } from '../../../features/auth/events/updated-confirmation-code-by-recovery-code.event';

@EventsHandler(UpdatedConfirmationCodeByRecoveryCodeEvent)
export class SendRecoveryCodeEventHandler
  implements IEventHandler<UpdatedConfirmationCodeByRecoveryCodeEvent>
{
  constructor(protected mailsService: MailsService) {}

  async handle(
    event: UpdatedConfirmationCodeByRecoveryCodeEvent,
  ): Promise<boolean> {
    const { userEntity } = event;
    return await this.mailsService.sendRecoveryCode(userEntity);
  }
}
