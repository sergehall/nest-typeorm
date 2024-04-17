import { ExecutionContext, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { JwtConfig } from '../../../config/jwt/jwt.config';
import { PayloadDto } from '../dto/payload.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { UsersEntity } from '../../users/entities/users.entity';

@Injectable()
export class WsJwtAuthGuard extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly jwtConfig: JwtConfig,
  ) {
    super({
      jwtFromRequest: WsJwtAuthGuard.extractJwt,
      ignoreExpiration: false,
      secretOrKey: jwtConfig.getJwtConfigValue('ACCESS_SECRET_KEY'),
    });
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

  private static extractJwt(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const headers = client.handshake.headers;
    const authHeader = headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Extract token excluding 'Bearer '
    }
    return null; // No token found
  }
}

// @Injectable()
// export class WsJwtAuthGuard extends PassportStrategy(Strategy) {
//   constructor(
//     private readonly usersRepo: UsersRepo,
//     private readonly jwtConfig: JwtConfig,
//   ) {
//     super(WsJwtAuthGuard.getJwtOptions(jwtConfig));
//   }
//
//   async validate(payload: PayloadDto): Promise<CurrentUserDto | null> {
//     const user: UsersEntity | null = await this.usersRepo.findNotBannedUserById(
//       payload.userId,
//     );
//
//     if (user && !user.isBanned) {
//       return {
//         userId: user.userId,
//         login: user.login,
//         email: user.email,
//         orgId: user.orgId,
//         roles: user.roles,
//         isBanned: user.isBanned,
//       };
//     }
//     return null;
//   }
//
//   protected static getJwtOptions(jwtConfig: JwtConfig) {
//     return {
//       jwtFromRequest: context
//         .switchToWs()
//         .getClient()
//         .client.handshake.headers.authorization.split(' ')[1],
//       ignoreExpiration: false,
//       secretOrKey: jwtConfig.getJwtConfigValue('ACCESS_SECRET_KEY'),
//       signOptions: {
//         expiresIn: jwtConfig.getJwtConfigValue('EXP_ACC_TIME'),
//       },
//     };
//   }
// }
