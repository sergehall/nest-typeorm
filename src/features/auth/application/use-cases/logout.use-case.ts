import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadDto } from '../../dto/payload.dto';
import { AddInvalidJwtToBlacklistCommand } from './add-refresh-token-to-blacklist.use-case';
import { DecodeTokenService } from '../../../../config/jwt/decode.service/decode-token-service';
import { DeleteDevicesAfterLogoutCommand } from '../../../security-devices/application/use-cases/delete-devices-after-logout.use-case';

export class LogoutCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    protected commandBus: CommandBus,
    protected decodeTokenService: DecodeTokenService,
  ) {}

  async execute(command: LogoutCommand): Promise<boolean> {
    const { refreshToken } = command;
    console.log(refreshToken);
    const payload: PayloadDto = await this.decodeTokenService.toExtractPayload(
      refreshToken,
    );

    await this.commandBus.execute(
      new AddInvalidJwtToBlacklistCommand(refreshToken, payload),
    );

    await this.commandBus.execute(new DeleteDevicesAfterLogoutCommand(payload));
    return true;
  }
}
