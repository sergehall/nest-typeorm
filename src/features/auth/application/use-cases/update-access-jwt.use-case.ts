import { PayloadDto } from '../../dto/payload.dto';
import { AccessToken } from '../../dto/accessToken.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigType } from '../../../../config/configuration';
import { ConfigService } from '@nestjs/config';

export class UpdateAccessJwtCommand {
  constructor(public currentPayload: PayloadDto) {}
}
@CommandHandler(UpdateAccessJwtCommand)
export class UpdateAccessJwtUseCase
  implements ICommandHandler<UpdateAccessJwtCommand>
{
  constructor(
    private jwtService: JwtService,
    protected configService: ConfigService<ConfigType, true>,
  ) {}
  async execute(command: UpdateAccessJwtCommand): Promise<AccessToken> {
    const payload = {
      userId: command.currentPayload.userId,
      deviceId: command.currentPayload.deviceId,
    };
    console.log(this.configService, '---this.configService---');
    const ddd = this.configService.get('jwtConfig', {
      infer: true,
    });
    console.log(ddd, '------');

    const ACCESS_SECRET_KEY = this.configService.get('jwtConfig', {
      infer: true,
    }).ACCESS_SECRET_KEY;
    const EXP_ACC_TIME = this.configService.get('jwtConfig', {
      infer: true,
    }).EXP_ACC_TIME;
    // const ACCESS_SECRET_KEY =
    //   Configuration.getConfiguration().jwtConfig.ACCESS_SECRET_KEY;
    // const EXP_ACC_TIME =
    //   Configuration.getConfiguration().jwtConfig.EXP_ACC_TIME;
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
