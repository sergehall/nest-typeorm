import { PayloadDto } from '../../dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtConfig } from '../../../../config/jwt/jwt-config';
import { AccessTokenDto } from '../../dto/access-token.dto';

export class UpdateAccessJwtCommand {
  constructor(public currentPayload: PayloadDto) {}
}
@CommandHandler(UpdateAccessJwtCommand)
export class UpdateAccessJwtUseCase
  implements ICommandHandler<UpdateAccessJwtCommand>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtConfig: JwtConfig,
  ) {}
  async execute(command: UpdateAccessJwtCommand): Promise<AccessTokenDto> {
    const payload = {
      userId: command.currentPayload.userId,
      deviceId: command.currentPayload.deviceId,
    };

    const ACCESS_SECRET_KEY = await this.jwtConfig.getAccSecretKey();
    const EXP_ACC_TIME = await this.jwtConfig.getExpAccTime();

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
