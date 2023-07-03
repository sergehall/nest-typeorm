import { RolesEnums } from '../../../ability/enums/roles.enums';
import { OrgIdEnums } from '../enums/org-id.enums';

export class BanInfo {
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
}
export class EmailConfirmation {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
  isConfirmedDate: string | null;
}
export class RegistrationData {
  ip: string;
  userAgent: string;
}
export class CreateUserRawSqlEntity {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  orgId: OrgIdEnums;
  roles: RolesEnums;
  banInfo: BanInfo;
  emailConfirmation: EmailConfirmation;
  registrationData: RegistrationData;
}
