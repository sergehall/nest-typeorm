import { JwtBlacklistDto } from '../../dto/jwt-blacklist.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlacklistJwtRawSqlRepository } from '../../infrastructure/raw-sql-repository/blacklist-jwt-raw-sql.repository';

export class AddRefreshTokenToBlackListCommand {
  constructor(public currentToken: JwtBlacklistDto) {}
}
@CommandHandler(AddRefreshTokenToBlackListCommand)
export class AddRefreshTokenToBlackListUseCase
  implements ICommandHandler<AddRefreshTokenToBlackListCommand>
{
  constructor(
    private blacklistJwtRawSqlRepository: BlacklistJwtRawSqlRepository,
  ) {}
  async execute(command: AddRefreshTokenToBlackListCommand): Promise<boolean> {
    return await this.blacklistJwtRawSqlRepository.addJWT(command.currentToken);
  }
}
