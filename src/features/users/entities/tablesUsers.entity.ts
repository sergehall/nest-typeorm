export class TablesUsersEntity {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  orgId: string;
  roles: string;
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
  isConfirmedDate: string | null;
  ip: string;
  userAgent: string;
}
