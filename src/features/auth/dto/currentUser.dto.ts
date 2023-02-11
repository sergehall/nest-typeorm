import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  Length,
  Matches,
} from 'class-validator';

export class BanInfo {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
export class CurrentUserDto {
  @IsNotEmpty()
  @Length(0, 50, {
    message: 'Incorrect id length! Must be max 50 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(6, 30, {
    message: 'Incorrect email length! Must be min 6, max 30 ch.',
  })
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  login: string;
  @IsNotEmpty()
  @Object()
  banInfo: BanInfo;
  @IsNotEmpty()
  @IsNumber()
  payloadExp: number;
}
