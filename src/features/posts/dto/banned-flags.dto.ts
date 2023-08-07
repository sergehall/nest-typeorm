import { IsBoolean } from 'class-validator';

export class BannedFlagsDto {
  @IsBoolean()
  dependencyIsBanned: boolean;
  @IsBoolean()
  banInfoIsBanned: boolean;
  @IsBoolean()
  isBanned: boolean;
}
