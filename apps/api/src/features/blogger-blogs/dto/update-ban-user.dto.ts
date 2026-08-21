import { IsBoolean, IsNotEmpty, Length } from 'class-validator';

export class UpdateBanUserDto {
  @IsNotEmpty()
  @IsBoolean({
    message: 'isBanned must be boolean.',
  })
  isBanned: boolean;
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Incorrect banReason length! Must be min 20 max 300 ch.',
  })
  banReason: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect blogId! Must be max 100 ch.',
  })
  blogId: string;
}
