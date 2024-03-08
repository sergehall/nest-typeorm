import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { PostgresConfig } from '../../../../config/db/postgres/postgres.config';
import { BotActivationLink } from '../../types/bot-activation-link.type';

export class GenerateTelegramActivationLinkCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(GenerateTelegramActivationLinkCommand)
export class GenerateTelegramActivationLinkUseCase
  implements ICommandHandler<GenerateTelegramActivationLinkCommand>
{
  constructor(private readonly postgresConfig: PostgresConfig) {}
  async execute(
    command: GenerateTelegramActivationLinkCommand,
  ): Promise<BotActivationLink> {
    const { currentUserDto } = command;

    const baseDomain = await this.postgresConfig.getDomain('PG_DOMAIN_HEROKU');
    const path = '/integrations/telegram/activate-bot';
    const query = `?code=${currentUserDto.userId}`;

    const completeURL = `${baseDomain}${path}${query}`;

    return { link: completeURL };
  }
}
