import { PayloadDto } from '../../dto/payload.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../../../config/jwt/jwt-config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ValidRefreshJwtCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(ValidRefreshJwtCommand)
export class ValidRefreshJwtUseCase
  implements ICommandHandler<ValidRefreshJwtCommand>
{
  constructor(private jwtService: JwtService, private jwtConfig: JwtConfig) {}
  async execute(command: ValidRefreshJwtCommand): Promise<PayloadDto | null> {
    const REFRESH_SECRET_KEY = this.jwtConfig.getRefSecretKey();
    if (!REFRESH_SECRET_KEY) throw new InternalServerErrorException();
    try {
      const result = await this.jwtService.verify(command.refreshToken, {
        secret: REFRESH_SECRET_KEY,
      });
      return result;
    } catch (err) {
      return null;
    }
  }
}
