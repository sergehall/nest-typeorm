import { IsNumber } from 'class-validator';

export class CountCorrectAnswerDto {
  @IsNumber()
  firstPlayerCountCorrectAnswer: number;
  @IsNumber()
  secondPlayerCountCorrectAnswer: number;
}
