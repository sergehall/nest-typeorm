import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { IsNotEmpty } from 'class-validator';
import { PairsGameQuizEntity } from '../entities/pairs-game-quiz.entity';
import { CountCorrectAnswerDto } from './correct-answer-counts-and-bonus.dto';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';

export class PairQuestionsAnswersScoresDto {
  @IsNotEmpty()
  pair: PairsGameQuizEntity;
  @IsNotEmpty()
  challengeQuestions: ChallengeQuestionsEntity[];
  @IsNotEmpty()
  challengeAnswers: ChallengeAnswersEntity[];
  @IsNotEmpty()
  scores: CountCorrectAnswerDto;
}
