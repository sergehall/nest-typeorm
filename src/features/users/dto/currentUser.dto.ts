import { IsBoolean, IsNotEmpty, Length, Matches } from 'class-validator';
import { OrgIdEnums } from '../enums/org-id.enums';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';

export class CurrentUserDto {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect id length! Must be max 50 ch.',
  })
  id: string;
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
  roles: UserRolesEnums;
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect payloadExp length! Must be min 0, max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  payloadExp: string;
}
