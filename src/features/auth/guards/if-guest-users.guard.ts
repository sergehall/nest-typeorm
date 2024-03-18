import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidAccessJwtCommand } from '../application/use-cases/valid-access-jwt.use-case';
import { PayloadDto } from '../dto/payload.dto';
import { InvalidJwtRepo } from '../infrastructure/invalid-jwt-repo';
import { UsersEntity } from '../../users/entities/users.entity';
import { GuestUsersRepo } from '../../users/infrastructure/guest-users.repo';
import { UsersRepo } from '../../users/infrastructure/users-repo';

@Injectable()
export class IfGuestUsersGuard implements CanActivate {
  constructor(
    private readonly invalidJwtRepo: InvalidJwtRepo,
    private readonly usersRepo: UsersRepo,
    private readonly guestUsersRepo: GuestUsersRepo,
    private readonly commandBus: CommandBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers || !request.headers.authorization) {
      request.user = await this.guestUsersRepo.getInstanceOfGuestUser();
      return true;
    }

    const accessToken = request.headers.authorization.split(' ')[1];
    const payload: PayloadDto = await this.commandBus.execute(
      new ValidAccessJwtCommand(accessToken),
    );
    const jwtExistInBlackList: boolean =
      await this.invalidJwtRepo.jwtExistInBlackList(accessToken);

    let user: UsersEntity | null = null;
    if (payload && !jwtExistInBlackList) {
      user = await this.usersRepo.findNotBannedUserById(payload.userId);
    }

    request.user = user
      ? {
          userId: user.userId,
          login: user.login,
          email: user.email,
          orgId: user.orgId,
          roles: user.roles,
          isBanned: user.isBanned,
        }
      : await this.guestUsersRepo.getInstanceOfGuestUser();

    return true;
  }
}

// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { CommandBus } from '@nestjs/cqrs';
// import { ValidAccessJwtCommand } from '../application/use-cases/valid-access-jwt.use-case';
// import { PayloadDto } from '../dto/payload.dto';
// import { InvalidJwtRepo } from '../infrastructure/invalid-jwt-repo';
// import { UsersEntity } from '../../users/entities/users.entity';
// import { GuestUsersRepo } from '../../users/infrastructure/guest-users.repo';
// import { UsersRepo } from '../../users/infrastructure/users-repo';
//
// @Injectable()
// export class IfGuestUsersGuard implements CanActivate {
//   constructor(
//     private readonly invalidJwtRepo: InvalidJwtRepo,
//     private readonly usersRepo: UsersRepo,
//     private readonly guestUsersRepo: GuestUsersRepo,
//     private readonly commandBus: CommandBus,
//   ) {}
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//
//     if (request.headers && request.headers.authorization) {
//       const accessToken = request.headers.authorization.split(' ')[1];
//
//       const payload: PayloadDto = await this.commandBus.execute(
//         new ValidAccessJwtCommand(accessToken),
//       );
//
//       const jwtExistInBlackList: boolean =
//         await this.invalidJwtRepo.jwtExistInBlackList(accessToken);
//
//       if (payload && !jwtExistInBlackList) {
//         const user: UsersEntity | null =
//           await this.usersRepo.findNotBannedUserById(payload.userId);
//
//         request.user =
//           user && !user.isBanned
//             ? {
//                 userId: user.userId,
//                 login: user.login,
//                 email: user.email,
//                 orgId: user.orgId,
//                 roles: user.roles,
//                 isBanned: user.isBanned,
//               }
//             : null;
//         return true;
//       }
//     }
//     request.user = await this.guestUsersRepo.getInstanceOfGuestUser();
//     return true;
//   }
// }
