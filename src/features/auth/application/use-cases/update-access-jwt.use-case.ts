import { PayloadDto } from '../../dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtConfig } from '../../../../config/jwt/jwt.config';
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
    const { currentPayload } = command;

    const payload = {
      userId: currentPayload.userId,
      deviceId: currentPayload.deviceId,
    };

    try {
      const ACCESS_SECRET_KEY =
        await this.jwtConfig.getJwtConfigValue('ACCESS_SECRET_KEY');
      const EXP_ACC_TIME =
        await this.jwtConfig.getJwtConfigValue('EXP_ACC_TIME');

      return {
        accessToken: this.jwtService.sign(payload, {
          secret: ACCESS_SECRET_KEY,
          expiresIn: EXP_ACC_TIME,
        }),
      };
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
