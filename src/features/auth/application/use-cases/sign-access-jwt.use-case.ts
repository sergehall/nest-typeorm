import { UsersEntity } from '../../../users/entities/users.entity';
import { AccessToken } from '../../dto/accessToken.dto';
import * as uuid4 from 'uuid4';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { getConfiguration } from '../../../../config/configuration';

export class SignAccessJwtUseCommand {
  constructor(public user: UsersEntity) {}
}

@CommandHandler(SignAccessJwtUseCommand)
export class SignAccessJwtUseCase
  implements ICommandHandler<SignAccessJwtUseCommand>
{
  constructor(private jwtService: JwtService) {}
  async execute(command: SignAccessJwtUseCommand): Promise<AccessToken> {
    const deviceId = uuid4().toString();
    const payload = {
      userId: command.user.id,
      email: command.user.email,
      deviceId: deviceId,
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
