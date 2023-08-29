import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadDto } from '../../dto/payload.dto';
import { UpdateRefreshJwtCommand } from './update-refresh-jwt.use-case';
import { DecodeTokenService } from '../../../../config/jwt/decode.service/decode-token-service';
import { AddInvalidJwtToBlacklistCommand } from './add-refresh-token-to-blacklist.use-case';
import { UpdateDeviceCommand } from '../../../security-devices/application/use-cases/update-device.use-case';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { UpdatedJwtAndPayloadDto } from '../../dto/updated-jwt-and-payload.dto';

export class RefreshJwtCommand {
  constructor(
    public refreshToken: string,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(RefreshJwtCommand)
export class RefreshJwtUseCase implements ICommandHandler<RefreshJwtCommand> {
  constructor(
    protected decodeTokenService: DecodeTokenService,
    protected commandBus: CommandBus,
  ) {}

  async execute(command: RefreshJwtCommand): Promise<UpdatedJwtAndPayloadDto> {
    const { refreshToken, ip, userAgent } = command;

    const currentPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(refreshToken);

    await this.commandBus.execute(
      new AddInvalidJwtToBlacklistCommand(refreshToken, currentPayload),
    );

    const updatedJwt: RefreshTokenDto = await this.commandBus.execute(
      new UpdateRefreshJwtCommand(currentPayload),
    );

    const updatedPayload: PayloadDto =
      await this.decodeTokenService.toExtractPayload(updatedJwt.refreshToken);

    await this.commandBus.execute(
      new UpdateDeviceCommand(updatedPayload, ip, userAgent),
    );

    return {
      updatedJwt: updatedJwt.refreshToken,
      updatedPayload: updatedPayload,
    };
  }
}
