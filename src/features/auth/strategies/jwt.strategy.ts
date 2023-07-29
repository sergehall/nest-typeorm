import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { PayloadDto } from '../dto/payload.dto';
import Configuration from '../../../config/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Configuration.getConfiguration().jwtConfig.ACCESS_SECRET_KEY,
      signOptions: {
        expiresIn: Configuration.getConfiguration().jwtConfig.EXP_ACC_TIME,
      },
    });
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
}
