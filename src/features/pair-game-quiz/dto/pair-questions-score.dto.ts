import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { IsNotEmpty } from 'class-validator';
import { PairsGameQuizEntity } from '../entities/pairs-game-quiz.entity';
import { CorrectAnswerCountsAndBonusDto } from './correct-answer-counts-and-bonus.dto';

export class PairQuestionsScoreDto {
  @IsNotEmpty()
  pair: PairsGameQuizEntity;
  @IsNotEmpty()
  challengeQuestions: ChallengeQuestionsEntity[];
  scores: CorrectAnswerCountsAndBonusDto;
}
