import {
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDate,
  Matches,
} from 'class-validator';
import { StatusGameEnum } from '../enums/status-game.enum';
import { AnswerStatusEnum } from '../enums/answer-status.enum';

class AnswerModel {
  @IsString()
  questionId: string;

  @IsEnum(AnswerStatusEnum, {
    message: 'Incorrect status must be type of Correct, Incorrect',
  })
  answerStatus: AnswerStatusEnum;

  @IsDate()
  addedAt: Date;
}

class PlayerModel {
  @IsString()
  id: string;

  @IsString()
  login: string;
}

class PlayerProgressModel {
  @ValidateNested({ each: true }) // Validates each answer object in the array
  @IsArray()
  answers: AnswerModel[];

  @ValidateNested()
  player: PlayerModel | null;

  @IsString()
  score: number;
}

class QuestionModel {
  @IsString()
  id: string;

  @IsString()
  body: string;
}

export class GameModel {
  @IsString()
  id: string;

  @ValidateNested()
  firstPlayerProgress: PlayerProgressModel;

  @ValidateNested()
  secondPlayerProgress: PlayerProgressModel;

  @ValidateNested({ each: true }) // Validates each question object in the array
  @IsArray()
  questions: QuestionModel[];

  @IsEnum(StatusGameEnum, {
    message: 'Incorrect status must be type of Pending, Competing, Concluded',
  })
  status: StatusGameEnum;

  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  pairCreatedDate: string;

  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  startGameDate: string;

  @Matches(
    '/\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z)/',
  )
  finishGameDate: string;
}
