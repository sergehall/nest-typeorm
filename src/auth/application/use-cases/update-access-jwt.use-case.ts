import { PayloadDto } from '../../dto/payload.dto';
import { AccessToken } from '../../dto/accessToken.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../../config/jwt/jwt-config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateAccessJwtCommand {
  constructor(public currentPayload: PayloadDto) {}
}
@CommandHandler(UpdateAccessJwtCommand)
export class UpdateAccessJwtUseCase
  implements ICommandHandler<UpdateAccessJwtCommand>
{
  constructor(private jwtService: JwtService, private jwtConfig: JwtConfig) {}
  async execute(command: UpdateAccessJwtCommand): Promise<AccessToken> {
    const payload = {
      userId: command.currentPayload.userId,
      deviceId: command.currentPayload.deviceId,
    };
    const ACCESS_SECRET_KEY = this.jwtConfig.getAccSecretKey();
    const EXP_ACC_TIME = this.jwtConfig.getExpAccTime();
    if (!ACCESS_SECRET_KEY || !EXP_ACC_TIME)
      throw new InternalServerErrorException();
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: ACCESS_SECRET_KEY,
        expiresIn: EXP_ACC_TIME,
      }),
    };
  }
}
