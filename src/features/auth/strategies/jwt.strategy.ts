import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PayloadDto } from '../dto/payload.dto';
import { JwtConfig } from '../../../config/jwt/jwt.config';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { UsersEntity } from '../../users/entities/users.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly jwtConfig: JwtConfig,
  ) {
    super(JwtStrategy.getJwtOptions(jwtConfig));
  }

  async validate(payload: PayloadDto): Promise<CurrentUserDto | null> {
    const user: UsersEntity | null = await this.usersRepo.findNotBannedUserById(
      payload.userId,
    );

    if (user && !user.isBanned) {
      return {
        userId: user.userId,
        login: user.login,
        email: user.email,
        orgId: user.orgId,
        roles: user.roles,
        isBanned: user.isBanned,
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
