import {
  IsBoolean,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { OrgIdEnums } from '../enums/org-id.enums';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';

export class TablesUsersEntity {
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  login: string;
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect email length! Must be min 6, max 20 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect passwordHash length! Must be min 1, max 100 ch.',
  })
  passwordHash: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect createdAt length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
  @IsNotEmpty()
  orgId: OrgIdEnums;
  @IsNotEmpty()
  roles: UserRolesEnums[];
  @IsNotEmpty()
  @IsBoolean({
    message: 'Incorrect isBanned length! Must be boolean.',
  })
  isBanned: boolean;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect createdAt length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  banDate: string | null;
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Incorrect banReason length! Must be min 20 max 300 ch.',
  })
  banReason: string | null;
  confirmationCode: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect expirationDate length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  expirationDate: string;
  @IsNotEmpty()
  @IsBoolean({
    message: 'Incorrect isConfirmed length! Must be boolean.',
  })
  isConfirmed: boolean;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect isConfirmedDate length! Must be max 100 ch.',
  })
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  isConfirmedDate: string | null;
  @IsNotEmpty()
  @MaxLength(20)
  ip: string;
  @IsNotEmpty()
  @MaxLength(50)
  userAgent: string;
}
