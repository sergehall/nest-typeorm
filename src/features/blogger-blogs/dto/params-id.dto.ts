import { IsNotEmpty, Length } from 'class-validator';

export class ParamsIdDto {
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Incorrect id length! Must be max 100 ch.',
  })
  id: string;
}
