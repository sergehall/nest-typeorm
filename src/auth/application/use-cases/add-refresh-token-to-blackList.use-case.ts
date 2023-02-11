import { JwtBlacklistDto } from '../../dto/jwt-blacklist.dto';
import { BlacklistJwtRepository } from '../../infrastructure/blacklist-jwt.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class AddRefreshTokenToBlackListCommand {
  constructor(public currentToken: JwtBlacklistDto) {}
}
@CommandHandler(AddRefreshTokenToBlackListCommand)
export class AddRefreshTokenToBlackListUseCase
  implements ICommandHandler<AddRefreshTokenToBlackListCommand>
{
  constructor(private blacklistJwtRepository: BlacklistJwtRepository) {}
  async execute(command: AddRefreshTokenToBlackListCommand): Promise<boolean> {
    return await this.blacklistJwtRepository.addJWT(command.currentToken);
  }
}
