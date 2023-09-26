import { IsNumber } from 'class-validator';

export class CorrectAnswerCountsAndBonusDto {
  @IsNumber()
  currentUserCorrectAnswerCount: number;
  @IsNumber()
  competitorCorrectAnswerCount: number;
}
