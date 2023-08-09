import { IsBoolean } from 'class-validator';

export class BannedFlagsDto {
  @IsBoolean()
  commentatorInfoIsBanned: boolean;
  @IsBoolean()
  dependencyIsBanned: boolean;
  @IsBoolean()
  banInfoIsBanned: boolean;
  @IsBoolean()
  isBanned: boolean;
}
