import { IsBoolean, IsNotEmpty, Length } from 'class-validator';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';

export class GuestUsersDto {
  @IsNotEmpty()
  @Length(0, 60, {
    message: 'Incorrect guestUserId length! Must be max 50 ch.',
  })
  guestUserId: string;
  @IsNotEmpty()
  roles: UserRolesEnums[];
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
