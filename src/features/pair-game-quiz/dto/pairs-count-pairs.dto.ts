import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PairsGameEntity } from '../entities/pairs-game.entity';

export class PairsCountPairsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PairsGameEntity)
  pairsGame: PairsGameEntity[];

  @IsInt()
  countPairsGame: number;
}
