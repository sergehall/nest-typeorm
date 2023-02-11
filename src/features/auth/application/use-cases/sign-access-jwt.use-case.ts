import { UsersEntity } from '../../../users/entities/users.entity';
import { AccessToken } from '../../dto/accessToken.dto';
import * as uuid4 from 'uuid4';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../../../config/jwt/jwt-config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SignAccessJwtUseCommand {
  constructor(public user: UsersEntity) {}
}

@CommandHandler(SignAccessJwtUseCommand)
export class SignAccessJwtUseCase
  implements ICommandHandler<SignAccessJwtUseCommand>
{
  constructor(private jwtService: JwtService, private jwtConfig: JwtConfig) {}
  async execute(command: SignAccessJwtUseCommand): Promise<AccessToken> {
    const deviceId = uuid4().toString();
    const payload = {
      userId: command.user.id,
      email: command.user.email,
      deviceId: deviceId,
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
