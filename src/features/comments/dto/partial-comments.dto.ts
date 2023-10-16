import {
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PartialCommentsDto {
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id length! Must be min 0, max 100 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Incorrect content length! Must be min 20, max 300 ch.',
  })
  content: string;
  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(100)
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  createdAt: string;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect id! Must be max 15 ch.',
  })
  commentatorId: string;
  @IsNotEmpty()
  @Length(3, 10, {
    message: 'Incorrect login length! Must be min 3, max 10 ch.',
  })
  @Matches('^[a-zA-Z0-9_-]*$')
  commentatorLogin: string;
}
