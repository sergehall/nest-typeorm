import { IsBoolean, IsNotEmpty, Length, Matches } from 'class-validator';

export class OwnerInfoDto {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 15 ch.',
  })
  userId: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  userLogin: string;
  @IsBoolean()
  isBanned: boolean;
}
