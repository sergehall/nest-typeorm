import { IsString, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Player {
  @IsString()
  id: string;

  @IsString()
  login: string;
}

export class GamesStatisticsViewModel {
  @IsNumber()
  sumScore: number;

  @IsNumber()
  avgScores: number;

  @IsNumber()
  gamesCount: number;

  @IsNumber()
  winsCount: number;

  @IsNumber()
  lossesCount: number;

  @IsNumber()
  drawsCount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => Player)
  player: Player;
}
