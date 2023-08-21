import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';

export type UserType = {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  orgId: string;
  roles: UserRolesEnums[];
  banDate: string | null;
  banReason: string | null;
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
  isConfirmedDate: string | null;
  ip: string;
  userAgent: string;
  isBanned: boolean;
};
