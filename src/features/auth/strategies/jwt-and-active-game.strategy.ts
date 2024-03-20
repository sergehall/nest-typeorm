import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { JwtConfig } from '../../../config/jwt/jwt.config';
import { PayloadDto } from '../dto/payload.dto';
import { UsersEntity } from '../../users/entities/users.entity';
import { GamePairsRepo } from '../../pair-game-quiz/infrastructure/game-pairs.repo';
import { CurrentUserAndActiveGameDto } from '../../users/dto/current-user-and-active-game.dto';
import { noOpenGameMessage } from '../../../common/filters/custom-errors-messages';

@Injectable()
export class JwtAndActiveGameStrategy extends PassportStrategy(
  Strategy,
  'jwt-active-game',
) {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly gamePairsRepo: GamePairsRepo,
    private readonly jwtConfig: JwtConfig,
  ) {
    super(JwtAndActiveGameStrategy.getJwtOptions(jwtConfig));
  }

  async validate(
    payload: PayloadDto,
  ): Promise<CurrentUserAndActiveGameDto | null> {
    const user: UsersEntity | null = await this.usersRepo.findNotBannedUserById(
      payload.userId,
    );
    if (user && !user.isBanned) {
      const activeGame = await this.gamePairsRepo.getActiveGameByUserId(
        payload.userId,
      );
      if (!activeGame) {
        throw new ForbiddenException(noOpenGameMessage); // No active game found, return 403
      }
      return {
        userId: user.userId,
        login: user.login,
        email: user.email,
        orgId: user.orgId,
        roles: user.roles,
        isBanned: user.isBanned,
        activeGame: activeGame,
      };
    }
    return null;
  }

  protected static getJwtOptions(jwtConfig: JwtConfig) {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.getJwtConfigValue('ACCESS_SECRET_KEY'),
      signOptions: {
        expiresIn: jwtConfig.getJwtConfigValue('EXP_ACC_TIME'),
      },
    };
  }
}
