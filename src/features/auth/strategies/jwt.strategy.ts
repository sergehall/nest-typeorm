import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { PayloadDto } from '../dto/payload.dto';
import { getConfiguration } from '../../../config/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getConfiguration().jwt.ACCESS_SECRET_KEY,
      signOptions: { expiresIn: getConfiguration().jwt.EXP_ACC_TIME },
    });
  }

  async validate(payload: PayloadDto) {
    const user = await this.usersService.findUserByUserId(payload.userId);
    if (user) {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        orgId: user.orgId,
        roles: user.roles,
        isBanned: user.banInfo.isBanned,
        payloadExp: new Date(payload.exp * 1000).toISOString(),
      };
    }
    return false;
  }
}
