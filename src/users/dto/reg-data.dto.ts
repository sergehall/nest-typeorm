import { IsNotEmpty, MaxLength } from 'class-validator';

export class RegDataDto {
  @IsNotEmpty()
  @MaxLength(100)
  ip: string;
  @IsNotEmpty()
  @MaxLength(100)
  userAgent: string;
}
