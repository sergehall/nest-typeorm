import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { PayloadDto } from '../dto/payload.dto';
import { JwtConfig } from '../../../config/jwt/jwt-config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtConfig: JwtConfig,
  ) {
    super(JwtStrategy.getJwtOptions(jwtConfig));
  }

  async validate(payload: PayloadDto) {
    const user = await this.usersService.findUserByUserId(payload.userId);
    if (user && !user.isBanned) {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        orgId: user.orgId,
        roles: user.roles,
        isBanned: user.isBanned,
        payloadExp: new Date(payload.exp * 1000).toISOString(),
      };
    }
    return false;
  }

  protected static getJwtOptions(jwtConfig: JwtConfig) {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.getAccSecretKey(),
      signOptions: {
        expiresIn: jwtConfig.getExpAccTime(),
      },
    };
  }
}
