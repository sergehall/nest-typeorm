import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { IsNotEmpty } from 'class-validator';
import { PairsGameEntity } from '../entities/pairs-game.entity';

export class PairAndQuestionsDto {
  @IsNotEmpty()
  pair: PairsGameEntity;
  @IsNotEmpty()
  challengeQuestions: ChallengeQuestionsEntity[];
}
