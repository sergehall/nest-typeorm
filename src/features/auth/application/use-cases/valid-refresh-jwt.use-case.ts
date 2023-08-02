import { PayloadDto } from '../../dto/payload.dto';
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
    const { refreshToken } = command;

    const REFRESH_SECRET_KEY = this.jwtConfig.getRefSecretKey();

    return await this.jwtService
      .verify(refreshToken, { secret: REFRESH_SECRET_KEY })
      .then((result: string) => result)
      .catch(() => null);
  }
}
