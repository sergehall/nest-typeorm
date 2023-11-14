import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AnswerDto } from '../../dto/answer.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AnswerStatusEnum } from '../../enums/answer-status.enum';
import {
  answeredAllQuestionsMessage,
  notFoundChallengeQuestions,
} from '../../../../common/filters/custom-errors-messages';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { GameQuestionsRepo } from '../../infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions.repo';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { AnswerViewModel } from '../../views/answer.view-model';
import { PlayerAnswersAllQuestionsCommand } from './player-answers-all-questions.use-case';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { GameOverEvent } from '../../events/game-over.event';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { ChallengeQuestionsEntity } from '../../entities/challenge-questions.entity';

export class SubmitAnswerCommand {
  constructor(
    public answerDto: AnswerDto,
    public activeGame: PairsGameEntity,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SubmitAnswerCommand)
export class SubmitAnswerForCurrentQuestionUseCase
  implements ICommandHandler<SubmitAnswerCommand>
{
  constructor(
    protected gameQuizRepo: GamePairsRepo,
    protected gameQuestionsRepo: GameQuestionsRepo,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
    protected challengesAnswersRepo: ChallengesAnswersRepo,
    protected commandBus: CommandBus,
    protected eventBus: EventBus,
  ) {}

  async execute(command: SubmitAnswerCommand): Promise<AnswerViewModel> {
    const { answerDto, activeGame, currentUserDto } = command;

    // Fetch challenge answers for the active game
    const challengeAnswers =
      await this.challengesAnswersRepo.getChallengeAnswersByGameId(
        activeGame.id,
      );

    // Count user's answers and total answers
    const { countAnswersUser, countAnswersBoth } = this.countChallengeAnswers(
      challengeAnswers,
      currentUserDto.userId,
    );

    // Must be less than 5
    await this.validateAnswerCount(countAnswersUser);

    // Get the next challenge question
    const nextQuestion = await this.fetchNextChallengeQuestion(
      activeGame.id,
      countAnswersUser,
    );

    const isAnswerCorrect = await this.verifyAnswer(
      nextQuestion.question.id,
      answerDto.answer,
    );

    const savedAnswer: ChallengeAnswersEntity = await this.saveAnswer(
      answerDto,
      nextQuestion,
      isAnswerCorrect,
      currentUserDto,
    );

    await this.handleGameProgress(
      countAnswersUser,
      countAnswersBoth,
      activeGame,
      currentUserDto,
    );

    return this.mapToViewModel(savedAnswer);
  }

  private async validateAnswerCount(countAnswersUser: number): Promise<void> {
    const MAX_ANSWER_COUNT = 5;
    if (countAnswersUser === MAX_ANSWER_COUNT) {
      throw new ForbiddenException(answeredAllQuestionsMessage);
    }
  }

  private async fetchNextChallengeQuestion(
    gameId: string,
    countAnswersUser: number,
  ): Promise<ChallengeQuestionsEntity> {
    const nextQuestion =
      await this.challengesQuestionsRepo.getNextChallengeQuestions(
        gameId,
        countAnswersUser,
      );
    if (!nextQuestion) {
      throw new ForbiddenException(notFoundChallengeQuestions);
    }
    return nextQuestion;
  }

  private async verifyAnswer(
    questionId: string,
    answer: string,
  ): Promise<boolean> {
    return await this.gameQuestionsRepo.verifyAnswerByQuestionsId(
      questionId,
      answer,
    );
  }

  private async saveAnswer(
    answerDto: AnswerDto,
    nextQuestion: ChallengeQuestionsEntity,
    isAnswerCorrect: boolean,
    user: CurrentUserDto,
  ): Promise<ChallengeAnswersEntity> {
    const answerStatus = isAnswerCorrect
      ? AnswerStatusEnum.CORRECT
      : AnswerStatusEnum.INCORRECT;
    const savedAnswer = await this.challengesAnswersRepo.saveChallengeAnswer(
      answerDto.answer,
      nextQuestion,
      answerStatus,
      user,
    );

    if (!savedAnswer) {
      throw new InternalServerErrorException(
        'Failed to save the challenge Answer.',
      );
    }
    return savedAnswer;
  }

  private async handleGameProgress(
    countAnswersUser: number,
    countAnswersBoth: number,
    game: PairsGameEntity,
    user: CurrentUserDto,
  ): Promise<void> {
    const currentAnswer = 1;
    const MAX_ANSWER_COUNT = 5;
    const MAX_ANSWER_BOTH_COUNT = 10;

    if (
      countAnswersUser + currentAnswer === MAX_ANSWER_COUNT &&
      countAnswersBoth + currentAnswer !== MAX_ANSWER_BOTH_COUNT
    ) {
      await this.commandBus.execute(
        new PlayerAnswersAllQuestionsCommand(game, user),
      );
    } else if (countAnswersBoth + currentAnswer === MAX_ANSWER_BOTH_COUNT) {
      await this.endGame(game);
    }
  }

  private async endGame(game: PairsGameEntity): Promise<void> {
    game.status = StatusGameEnum.FINISHED;
    game.finishGameDate = new Date().toISOString();
    await this.gameQuizRepo.saveGame(game);
    this.publishGameOverEvent(game);
  }

  private publishGameOverEvent(game: PairsGameEntity): void {
    const event: GameOverEvent = new GameOverEvent(game);
    game.events.push(event);
    game.events.forEach((e) => this.eventBus.publish(e));
  }

  private mapToViewModel(savedAnswer: ChallengeAnswersEntity): AnswerViewModel {
    return {
      questionId: savedAnswer.question.id,
      answerStatus: savedAnswer.answerStatus,
      addedAt: savedAnswer.addedAt,
    };
  }

  private countChallengeAnswers(
    challengeAnswers: ChallengeAnswersEntity[],
    userId: string,
  ): { countAnswersUser: number; countAnswersBoth: number } {
    return challengeAnswers.reduce(
      (counts, answer) => {
        counts.countAnswersBoth++;
        if (answer.answerOwner.userId === userId) {
          counts.countAnswersUser++;
        }
        return counts;
      },
      { countAnswersUser: 0, countAnswersBoth: 0 },
    );
  }
}
