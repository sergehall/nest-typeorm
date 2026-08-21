import { IsString, Length } from 'class-validator';

export class AnswerDto {
  @IsString()
  @Length(1, 100, {
    message: 'Incorrect answer! Must be min 1 ch, max 100 ch.',
  })
  answer: string;
}
