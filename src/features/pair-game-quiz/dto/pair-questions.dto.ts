import { PairGameQuizEntity } from '../entities/pair-game-quiz.entity';
import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { IsNotEmpty } from 'class-validator';

export class PairQuestionsDto {
  @IsNotEmpty()
  pair: PairGameQuizEntity;
  @IsNotEmpty()
  challengeQuestions: ChallengeQuestionsEntity[];
}
