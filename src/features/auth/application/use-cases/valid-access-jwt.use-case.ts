import { PayloadDto } from '../../dto/payload.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../../../config/jwt/jwt.config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ValidAccessJwtCommand {
  constructor(public accessToken: string) {}
}

@CommandHandler(ValidAccessJwtCommand)
export class ValidAccessJwtUseCase
  implements ICommandHandler<ValidAccessJwtCommand>
{
  constructor(
    private jwtService: JwtService,
    private jwtConfig: JwtConfig,
  ) {}
  async execute(command: ValidAccessJwtCommand): Promise<PayloadDto | null> {
    const { accessToken } = command;

    const ACCESS_SECRET_KEY =
      this.jwtConfig.getJwtConfigValue('ACCESS_SECRET_KEY');

    try {
      const payload: PayloadDto = await this.jwtService.verify(accessToken, {
        secret: ACCESS_SECRET_KEY,
      });

      // Token verification was successful, return the payload
      return payload;
    } catch (error) {
      return null; // Token verification failed, return null
    }
  }
}
