import { UsersEntity } from '../entities/users.entity';
import { SaUserViewModel } from '../../sa/views/sa-user-view-model';
import { UserViewModel } from '../views/user.view-model';

export class UsersService {
  async transformUserForSa(
    usersArr: UsersEntity[],
  ): Promise<SaUserViewModel[]> {
    return usersArr.map((user: UsersEntity) => ({
      id: user.userId,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    }));
  }

  async transformedArrUsers(usersArr: UsersEntity[]): Promise<UserViewModel[]> {
    return usersArr.map((user: UsersEntity) => ({
      id: user.userId,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    }));
  }
}
