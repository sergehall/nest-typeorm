import { PairsGameEntity } from '../entities/pairs-game.entity';

export class GameOverEvent {
  constructor(public game: PairsGameEntity) {}
}
