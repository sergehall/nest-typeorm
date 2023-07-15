import { PayloadDto } from '../../dto/payload.dto';
import { AccessToken } from '../../dto/accessToken.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { getConfiguration } from '../../../../config/configuration';

export class UpdateAccessJwtCommand {
  constructor(public currentPayload: PayloadDto) {}
}
@CommandHandler(UpdateAccessJwtCommand)
export class UpdateAccessJwtUseCase
  implements ICommandHandler<UpdateAccessJwtCommand>
{
  constructor(private jwtService: JwtService) {}
  async execute(command: UpdateAccessJwtCommand): Promise<AccessToken> {
    const payload = {
      userId: command.currentPayload.userId,
      deviceId: command.currentPayload.deviceId,
    };
    const ACCESS_SECRET_KEY = getConfiguration().jwt.ACCESS_SECRET_KEY;
    const EXP_ACC_TIME = getConfiguration().jwt.EXP_ACC_TIME;
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
