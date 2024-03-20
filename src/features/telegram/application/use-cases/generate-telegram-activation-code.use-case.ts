import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { BotActivationLink } from '../../types/bot-activation-link.type';
import { TelegramUrlsEnum } from '../../enums/telegram-urls.enum';
import { TelegramConfig } from '../../../../config/telegram/telegram.config';

export class GenerateTelegramActivationLinkCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(GenerateTelegramActivationLinkCommand)
export class GenerateTelegramActivationLinkUseCase
  implements ICommandHandler<GenerateTelegramActivationLinkCommand>
{
  constructor(private readonly telegramConfig: TelegramConfig) {}
  async execute(
    command: GenerateTelegramActivationLinkCommand,
  ): Promise<BotActivationLink> {
    const { currentUserDto } = command;

    const telegramBaseShortUrl = TelegramUrlsEnum.BaseShortUrl;

    const botName = await this.telegramConfig.getTelegramValue(
      'TELEGRAM_BOT_USERNAME',
    );

    // const query = `?start=code${currentUserDto.userId}`;
    const query = `?code=${currentUserDto.userId}`;

    const completeURL = `${telegramBaseShortUrl}/${botName}${query}`;
    console.log(completeURL, 'link: completeURL');
    return { link: completeURL };
  }
}
