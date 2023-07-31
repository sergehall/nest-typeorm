import { UsersEntity } from '../../../users/entities/users.entity';
import * as uuid4 from 'uuid4';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtConfig } from '../../../../config/jwt/jwt-config';
import { AccessTokenDto } from '../../dto/access-token.dto';

export class SignAccessJwtUseCommand {
  constructor(public user: UsersEntity) {}
}

@CommandHandler(SignAccessJwtUseCommand)
export class SignAccessJwtUseCase
  implements ICommandHandler<SignAccessJwtUseCommand>
{
  constructor(private jwtService: JwtService, private jwtConfig: JwtConfig) {}
  async execute(command: SignAccessJwtUseCommand): Promise<AccessTokenDto> {
    const ACCESS_SECRET_KEY = await this.jwtConfig.getAccSecretKey();
    const EXP_ACC_TIME = await this.jwtConfig.getExpAccTime();

    const deviceId = uuid4().toString();
    const payload = {
      userId: command.user.id,
      email: command.user.email,
      deviceId: deviceId,
    };

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
