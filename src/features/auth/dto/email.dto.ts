import { IsNotEmpty, Matches } from 'class-validator';

export class EmailDto {
  @IsNotEmpty()
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
}
