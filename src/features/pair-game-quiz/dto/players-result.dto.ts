import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { GamesResultsEnum } from '../enums/games-results.enum';
import { UsersEntity } from '../../users/entities/users.entity';

class PlayerResult {
  @IsNotEmpty()
  player: UsersEntity;

  @IsNumber()
  sumScore: number;

  @IsEnum(GamesResultsEnum)
  gameResult: GamesResultsEnum;
}

export class PlayersResultDto {
  firstPlayer: PlayerResult;
  secondPlayer: PlayerResult;
}
