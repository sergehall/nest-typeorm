import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class GameSummaryModel {
  @IsNumber()
  sumScore: number;

  @IsNumber()
  avgScores: number;

  @IsInt()
  @IsPositive()
  gamesCount: number;

  @IsInt()
  @Min(0)
  winsCount: number;

  @IsInt()
  @Min(0)
  lossesCount: number;

  @IsInt()
  @Min(0)
  drawsCount: number;
}
