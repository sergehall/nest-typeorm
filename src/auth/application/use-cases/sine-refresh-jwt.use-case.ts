import { UsersEntity } from '../../../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../../config/jwt/jwt-config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SineRefreshJwtCommand {
  constructor(public user: UsersEntity) {}
}

@CommandHandler(SineRefreshJwtCommand)
export class SineRefreshJwtUseCase
  implements ICommandHandler<SineRefreshJwtCommand>
{
  constructor(private jwtService: JwtService, private jwtConfig: JwtConfig) {}
  async execute(command: SineRefreshJwtCommand) {
    const deviceId = uuid4().toString();
    const payload = {
      userId: command.user.id,
      email: command.user.email,
      deviceId: deviceId,
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
