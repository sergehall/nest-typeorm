import { PayloadDto } from '../../dto/payload.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../../../config/jwt/jwt.config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { jwtCookiesIncorrect } from '../../../../common/filters/custom-errors-messages';

export class ValidRefreshJwtCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(ValidRefreshJwtCommand)
export class ValidRefreshJwtUseCase
  implements ICommandHandler<ValidRefreshJwtCommand>
{
  constructor(
    private jwtService: JwtService,
    private jwtConfig: JwtConfig,
  ) {}
  async execute(command: ValidRefreshJwtCommand): Promise<PayloadDto | null> {
    const { refreshToken } = command;

    const REFRESH_SECRET_KEY =
      await this.jwtConfig.getJwtConfigValue('REFRESH_SECRET_KEY');

    try {
      const result = await this.jwtService.verify(refreshToken, {
        secret: REFRESH_SECRET_KEY,
      });
      return result;
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        { message: [jwtCookiesIncorrect] },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
