import { ChallengeQuestionsEntity } from '../entities/challenge-questions.entity';
import { IsNotEmpty } from 'class-validator';
import { CountCorrectAnswerDto } from './correct-answer-counts-and-bonus.dto';
import { ChallengeAnswersEntity } from '../entities/challenge-answers.entity';
import { PairsGameEntity } from '../entities/pairs-game.entity';

export class PairQuestionsAnswersScoresDto {
  @IsNotEmpty()
  pair: PairsGameEntity;
  @IsNotEmpty()
  challengeQuestions: ChallengeQuestionsEntity[];
  @IsNotEmpty()
  challengeAnswers: ChallengeAnswersEntity[];
  @IsNotEmpty()
  scores: CountCorrectAnswerDto;
}
