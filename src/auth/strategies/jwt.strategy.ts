import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { PayloadDto } from '../dto/payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_SECRET_KEY,
      signOptions: { expiresIn: process.env.EXP_ACC_TIME },
    });
  }

  async validate(payload: PayloadDto) {
    const user = await this.usersService.findUserByUserId(payload.userId);
    if (user) {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        banInfo: { isBanned: user.banInfo.isBanned },
        payloadExp: new Date(payload.exp * 1000).toISOString(),
      };
    }
    return false;
  }
}
