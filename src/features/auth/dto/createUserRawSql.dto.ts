import { IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateUserRawSqlDto {
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;
  @IsNotEmpty()
  @Length(6, 20, {
    message: 'Incorrect email length! Must be min 6, max 20 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  passwordHash: string;
  createdAt: string;
  orgId: string;
  roles: string;
  isBanned: boolean;
  banDate: string | null;
  banReason: null;
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
  isConfirmedDate: string | null;
  ip: string;
  userAgent: string;
}
