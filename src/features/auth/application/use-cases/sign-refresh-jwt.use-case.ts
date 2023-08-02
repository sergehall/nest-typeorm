import * as uuid4 from 'uuid4';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { JwtConfig } from '../../../../config/jwt/jwt-config';

export class SineRefreshJwtCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(SineRefreshJwtCommand)
export class SignRefreshJwtUseCase
  implements ICommandHandler<SineRefreshJwtCommand>
{
  constructor(private jwtService: JwtService, private jwtConfig: JwtConfig) {}
  async execute(command: SineRefreshJwtCommand) {
    const { currentUserDto } = command;

    const REFRESH_SECRET_KEY = this.jwtConfig.getRefSecretKey();
    const EXP_REF_TIME = this.jwtConfig.getExpRefTime();

    const payloadData = {
      userId: currentUserDto.id,
      email: currentUserDto.email,
      deviceId: uuid4().toString(),
    };

    if (!REFRESH_SECRET_KEY || !EXP_REF_TIME)
      throw new InternalServerErrorException();
    return {
      refreshToken: this.jwtService.sign(payloadData, {
        secret: REFRESH_SECRET_KEY,
        expiresIn: EXP_REF_TIME,
      }),
    };
  }
}
