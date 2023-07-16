import * as uuid4 from 'uuid4';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { getConfiguration } from '../../../../config/configuration';

export class SineRefreshJwtCommand {
  constructor(public currentUserDto: CurrentUserDto) {}
}

@CommandHandler(SineRefreshJwtCommand)
export class SignRefreshJwtUseCase
  implements ICommandHandler<SineRefreshJwtCommand>
{
  constructor(private jwtService: JwtService) {}
  async execute(command: SineRefreshJwtCommand) {
    const payload = {
      userId: command.currentUserDto.id,
      email: command.currentUserDto.email,
      deviceId: uuid4().toString(),
    };
    const REFRESH_SECRET_KEY = getConfiguration().jwt.REFRESH_SECRET_KEY;
    const EXP_REF_TIME = getConfiguration().jwt.EXP_REF_TIME;
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
