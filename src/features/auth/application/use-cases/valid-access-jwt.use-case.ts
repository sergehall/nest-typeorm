import { PayloadDto } from '../../dto/payload.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../../../config/jwt/jwt-config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ValidAccessJwtCommand {
  constructor(public accessToken: string) {}
}

@CommandHandler(ValidAccessJwtCommand)
export class ValidAccessJwtUseCase
  implements ICommandHandler<ValidAccessJwtCommand>
{
  constructor(private jwtService: JwtService, private jwtConfig: JwtConfig) {}
  async execute(command: ValidAccessJwtCommand): Promise<PayloadDto | null> {
    const { accessToken } = command;

    const ACCESS_SECRET_KEY = this.jwtConfig.getAccSecretKey();

    const result = await this.jwtService.verify(accessToken, {
      secret: ACCESS_SECRET_KEY,
    });
    return result;
  }
}
