import { JwtBlacklistDto } from '../../dto/jwt-blacklist.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlacklistJwtRawSqlRepository } from '../../infrastructure/blacklist-jwt-raw-sql.repository';

export class AddRefreshTokenToBlacklistCommand {
  constructor(public refreshTokenToBlackList: JwtBlacklistDto) {}
}
@CommandHandler(AddRefreshTokenToBlacklistCommand)
export class AddRefreshTokenToBlacklistUseCase
  implements ICommandHandler<AddRefreshTokenToBlacklistCommand>
{
  constructor(
    private blacklistJwtRawSqlRepository: BlacklistJwtRawSqlRepository,
  ) {}
  async execute(command: AddRefreshTokenToBlacklistCommand): Promise<boolean> {
    return await this.blacklistJwtRawSqlRepository.addJWT(
      command.refreshTokenToBlackList,
    );
  }
}
