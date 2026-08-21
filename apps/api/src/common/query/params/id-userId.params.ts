import { IsNotEmpty, Length } from 'class-validator';

export class IdUserIdParams {
  @IsNotEmpty()
  @Length(1, 50, {
    message: 'Incorrect id length! Must be max 100 ch.',
  })
  id: string;
  @IsNotEmpty()
  @Length(1, 50, {
    message: 'Incorrect userId length! Must be max 100 ch.',
  })
  userId: string;
}
