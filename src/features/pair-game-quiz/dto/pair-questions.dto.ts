import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { IsNotEmpty } from 'class-validator';
import { PairsGameQuizEntity } from '../entities/pairs-game-quiz.entity';

export class PairQuestionsDto {
  @IsNotEmpty()
  pair: PairsGameQuizEntity;
  @IsNotEmpty()
  challengeQuestions: ChallengeQuestionsEntity[];
}
