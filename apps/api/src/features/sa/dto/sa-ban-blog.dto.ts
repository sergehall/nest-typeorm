import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SaBanBlogDto {
  @IsNotEmpty()
  @IsBoolean({
    message: 'Incorrect isBanned length! Must be boolean.',
  })
  isBanned: boolean;
}
