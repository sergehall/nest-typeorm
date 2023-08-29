import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadDto } from '../../dto/payload.dto';
import { UpdateRefreshJwtCommand } from './update-refresh-jwt.use-case';
import { CreateDeviceCommand } from '../../../security-devices/application/use-cases/create-device.use-case';
import { DecodeTokenService } from '../../../../config/jwt/decode.service/decode-token-service';
import { AddInvalidJwtToBlacklistCommand } from './add-refresh-token-to-blacklist.use-case';

export class RefreshTokenCommand {
  constructor(
    public refreshToken: string,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    protected decodeTokenService: DecodeTokenService,
    protected commandBus: CommandBus,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const { refreshToken, ip, userAgent } = command;

    const currentPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(refreshToken);

    await this.commandBus.execute(
      new AddInvalidJwtToBlacklistCommand(refreshToken, currentPayload),
    );

    const newRefreshToken = await this.commandBus.execute(
      new UpdateRefreshJwtCommand(currentPayload),
    );

    const newPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(
        newRefreshToken.refreshToken,
      );

    await this.commandBus.execute(
      new CreateDeviceCommand(newPayload, ip, userAgent),
    );
    return { refreshToken: 'refreshToken' };
  }
}
