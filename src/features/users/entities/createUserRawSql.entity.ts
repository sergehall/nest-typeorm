import { RolesEnums } from '../../../ability/enums/roles.enums';
import { OrgIdEnums } from '../enums/org-id.enums';
import {
  IsBoolean,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class BanInfo {
  @IsBoolean()
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
}
export class EmailConfirmation {
  confirmationCode: string;
  expirationDate: string;
  @IsBoolean()
  isConfirmed: boolean;
  isConfirmedDate: string | null;
}
export class RegistrationData {
  @IsNotEmpty()
  @MaxLength(100)
  ip: string;
  @IsNotEmpty()
  @MaxLength(100)
  userAgent: string;
}
export class CreateUserRawSqlEntity {
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  login: string;
  @IsNotEmpty()
  @Length(6, 30, {
    message: 'Incorrect email length! Must be min 6, max 30 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  passwordHash: string;
  createdAt: string;
  orgId: OrgIdEnums;
  roles: RolesEnums;
  banInfo: BanInfo;
  emailConfirmation: EmailConfirmation;
  registrationData: RegistrationData;
}
