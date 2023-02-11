import { PayloadDto } from '../../dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../../config/jwt/jwt-config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateRefreshJwtCommand {
  constructor(public currentPayload: PayloadDto) {}
}

@CommandHandler(UpdateRefreshJwtCommand)
export class UpdateRefreshJwtUseCase
  implements ICommandHandler<UpdateRefreshJwtCommand>
{
  constructor(private jwtService: JwtService, private jwtConfig: JwtConfig) {}
  async execute(command: UpdateRefreshJwtCommand) {
    const payload = {
      userId: command.currentPayload.userId,
      deviceId: command.currentPayload.deviceId,
    };
    const REFRESH_SECRET_KEY = this.jwtConfig.getRefSecretKey();
    const EXP_REF_TIME = this.jwtConfig.getExpRefTime();
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
