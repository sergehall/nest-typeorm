import { PayloadDto } from '../../dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import Configuration from '../../../../config/configuration';

export class UpdateRefreshJwtCommand {
  constructor(public currentPayload: PayloadDto) {}
}

@CommandHandler(UpdateRefreshJwtCommand)
export class UpdateRefreshJwtUseCase
  implements ICommandHandler<UpdateRefreshJwtCommand>
{
  constructor(private jwtService: JwtService) {}
  async execute(command: UpdateRefreshJwtCommand) {
    const { REFRESH_SECRET_KEY, EXP_REF_TIME } =
      Configuration.getConfiguration().jwtConfig;

    const payload = {
      userId: command.currentPayload.userId,
      deviceId: command.currentPayload.deviceId,
    };

    if (!REFRESH_SECRET_KEY || !EXP_REF_TIME)
      throw new InternalServerErrorException();
    return {
      refreshToken: this.jwtService.sign(payload, {
        secret: REFRESH_SECRET_KEY,
        expiresIn: EXP_REF_TIME,
      }),
    };
  }
}
