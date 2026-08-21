import { IsBoolean, IsNotEmpty, Length, Matches } from 'class-validator';
import { OrgIdEnums } from '../enums/org-id.enums';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';

export class CurrentUserDto {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect id length! Must be max 50 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;
  @IsNotEmpty({ message: 'Email should not be empty' })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @IsNotEmpty()
  orgId: OrgIdEnums;
  @IsNotEmpty()
  roles: UserRolesEnums[];
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
