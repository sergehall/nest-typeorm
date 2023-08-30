import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DecodeTokenService } from '../../../../config/jwt/decode.service/decode-token-service';
import { PayloadDto } from '../../dto/payload.dto';
import { SignRefreshJwtCommand } from './sign-refresh-jwt.use-case';
import { CreateDeviceCommand } from '../../../security-devices/application/use-cases/create-device.use-case';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { Response } from 'express';
import { SignAccessJwtUseCommand } from './sign-access-jwt.use-case';
import { AccessTokenDto } from '../../dto/access-token.dto';

export class LoginCommand {
  constructor(
    public currentUserDto: CurrentUserDto,
    public ip: string,
    public userAgent: string,
    public res: Response,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    protected decodeTokenService: DecodeTokenService,
    protected commandBus: CommandBus,
  ) {}
  async execute(command: LoginCommand): Promise<AccessTokenDto> {
    const { currentUserDto, ip, userAgent, res } = command;

    const signedToken = await this.commandBus.execute(
      new SignRefreshJwtCommand(currentUserDto),
    );

    const payload: PayloadDto = await this.decodeTokenService.toExtractPayload(
      signedToken.refreshToken,
    );

    await this.commandBus.execute(
      new CreateDeviceCommand(payload, ip, userAgent),
    );

    res.cookie('refreshToken', signedToken, {
      httpOnly: true,
      secure: true,
    });

    return await this.commandBus.execute(
      new SignAccessJwtUseCommand(currentUserDto),
    );
  }
}
