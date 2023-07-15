import { PayloadDto } from '../../dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { getConfiguration } from '../../../../config/configuration';

export class UpdateRefreshJwtCommand {
  constructor(public currentPayload: PayloadDto) {}
}

@CommandHandler(UpdateRefreshJwtCommand)
export class UpdateRefreshJwtUseCase
  implements ICommandHandler<UpdateRefreshJwtCommand>
{
  constructor(private jwtService: JwtService) {}
  async execute(command: UpdateRefreshJwtCommand) {
    const payload = {
      userId: command.currentPayload.userId,
      deviceId: command.currentPayload.deviceId,
    };
    const REFRESH_SECRET_KEY = getConfiguration().jwt.REFRESH_SECRET_KEY;
    const EXP_REF_TIME = getConfiguration().jwt.EXP_REF_TIME;
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
