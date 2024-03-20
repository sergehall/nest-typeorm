import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayloadDto } from '../../dto/payload.dto';
import { UpdateRefreshJwtCommand } from './update-refresh-jwt.use-case';
import { AddInvalidJwtToBlacklistCommand } from './add-refresh-token-to-blacklist.use-case';
import { UpdateDeviceCommand } from '../../../security-devices/application/use-cases/update-device.use-case';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { Response } from 'express';
import { UpdateAccessJwtCommand } from './update-access-jwt.use-case';
import { AccessTokenDto } from '../../dto/access-token.dto';
import { AuthService } from '../auth.service';

export class RefreshJwtCommand {
  constructor(
    public refreshTokenDto: RefreshTokenDto,
    public ip: string,
    public userAgent: string,
    public res: Response,
  ) {}
}

@CommandHandler(RefreshJwtCommand)
export class RefreshJwtUseCase implements ICommandHandler<RefreshJwtCommand> {
  constructor(
    protected authService: AuthService,
    protected commandBus: CommandBus,
  ) {}

  async execute(command: RefreshJwtCommand): Promise<AccessTokenDto> {
    const { refreshTokenDto, ip, userAgent, res } = command;
    const { refreshToken } = refreshTokenDto;

    const currentPayload: PayloadDto =
      await this.authService.toExtractPayload(refreshToken);

    const currentTimestamp = new Date().toISOString();
    const expirationTimestamp = new Date(
      currentPayload.exp * 1000,
    ).toISOString();

    if (expirationTimestamp > currentTimestamp) {
      await this.commandBus.execute(
        new AddInvalidJwtToBlacklistCommand(refreshToken, currentPayload),
      );
    }

    const updatedJwt: RefreshTokenDto = await this.commandBus.execute(
      new UpdateRefreshJwtCommand(currentPayload),
    );

    res.cookie('refreshToken', updatedJwt, {
      httpOnly: true,
      secure: true,
    });

    const updatedPayload: PayloadDto = await this.authService.toExtractPayload(
      updatedJwt.refreshToken,
    );

    await this.commandBus.execute(
      new UpdateDeviceCommand(updatedPayload, ip, userAgent),
    );

    return await this.commandBus.execute(
      new UpdateAccessJwtCommand(updatedPayload),
    );
  }
}
