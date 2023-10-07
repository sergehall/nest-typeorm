import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { GamesResultsEnum } from '../enums/games-results.enum';
import { UsersEntity } from '../../users/entities/users.entity';

export class PlayersResultDto {
  @IsNotEmpty()
  player: UsersEntity;

  @IsNumber()
  sumScore: number;

  @IsEnum(GamesResultsEnum)
  gameResult: GamesResultsEnum;
}
