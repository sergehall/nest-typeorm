import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { AnswerStatusEnum } from '../enums/answer-status.enum';

export class AnswerViewModel {
  @IsString()
  @Length(1, 100, {
    message: 'Incorrect questionId! Must be min 1 ch, max 100 ch.',
  })
  questionId: string;

  @IsEnum(AnswerStatusEnum, {
    message: 'answerStatus must be a valid status (Correct or Incorrect)',
  })
  answerStatus: AnswerStatusEnum;

  @IsNotEmpty()
  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  addedAt: string;
}
