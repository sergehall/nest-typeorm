import { IsNumber } from 'class-validator';

export class CorrectAnswerCountsAndBonusDto {
  @IsNumber()
  firstPlayerCountCorrectAnswer: number;
  @IsNumber()
  secondPlayerCountCorrectAnswer: number;
}
