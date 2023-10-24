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
import { AnswerViewModel } from '../../view-models/answer.view-model';
import { PlayerAnswersAllQuestionsCommand } from './player-answers-all-questions.use-case';
import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { CurrentUserDto } from '../../../users/dto/current-user.dto';
import { GameOverEvent } from '../../events/game-over.event';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';

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
    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getChallengeAnswersByGameId(
        activeGame.id,
      );

    // Count user's answers and total answers
    const counts: { countAnswersUser: number; countAnswersBoth: number } =
      await this.countsChallengeAnswers(
        challengeAnswers,
        currentUserDto.userId,
      );

    const countAnswersUser = counts.countAnswersUser;
    const countAnswersBoth = counts.countAnswersBoth;

    const MAX_ANSWER_COUNT = 5;
    const MAX_ANSWER_BOTH_COUNT = 10;

    switch (countAnswersUser) {
      case MAX_ANSWER_COUNT:
        throw new ForbiddenException(answeredAllQuestionsMessage);
      default:
        // Get the next challenge question
        const nextQuestion =
          await this.challengesQuestionsRepo.getNextChallengeQuestions(
            activeGame.id,
            countAnswersUser,
          );

        if (!nextQuestion) {
          throw new ForbiddenException(notFoundChallengeQuestions);
        } else if (nextQuestion) {
          // Verify the answer for the next question
          const verifyAnswer =
            await this.gameQuestionsRepo.verifyAnswerByQuestionsId(
              nextQuestion.question.id,
              answerDto.answer,
            );

          const answerStatus: AnswerStatusEnum = verifyAnswer
            ? AnswerStatusEnum.CORRECT
            : AnswerStatusEnum.INCORRECT;

          const saveChallengeAnswer: ChallengeAnswersEntity | null =
            await this.challengesAnswersRepo.saveChallengeAnswer(
              answerDto.answer,
              nextQuestion,
              answerStatus,
              currentUserDto,
            );

          if (saveChallengeAnswer) {
            const currentAnswer: number = 1;

            if (
              // Check if the user has answered all questions
              countAnswersUser + currentAnswer === MAX_ANSWER_COUNT &&
              countAnswersBoth + currentAnswer !== MAX_ANSWER_BOTH_COUNT
            ) {
              await this.commandBus.execute(
                new PlayerAnswersAllQuestionsCommand(
                  activeGame,
                  currentUserDto,
                ),
              );
            } else if (
              countAnswersBoth + currentAnswer ===
              MAX_ANSWER_BOTH_COUNT
            ) {
              activeGame.status = StatusGameEnum.FINISHED;
              activeGame.finishGameDate = new Date().toISOString();

              // Save the updated game StatusGameEnum.FINISHED
              await this.gameQuizRepo.saveGame(activeGame);

              const event: GameOverEvent = new GameOverEvent(activeGame);
              activeGame.events.push(event);

              // publish when after GameOver
              activeGame.events.forEach((e) => {
                this.eventBus.publish(e);
              });
            }

            return {
              questionId: saveChallengeAnswer.question.id,
              answerStatus: saveChallengeAnswer.answerStatus,
              addedAt: saveChallengeAnswer.addedAt,
            };
          }
        }

        throw new InternalServerErrorException(
          'Failed with AnswerForCurrentQuestionUseCase.',
        );
    }
  }

  // Helper function to count user's answers and total answers
  private async countsChallengeAnswers(
    challengeAnswers: ChallengeAnswersEntity[],
    userId: string,
  ): Promise<{ countAnswersUser: number; countAnswersBoth: number }> {
    let countAnswersUser = 0;
    let countAnswersBoth = 0;

    for (let i = 0; i < challengeAnswers.length; i++) {
      countAnswersBoth++;
      if (challengeAnswers[i].answerOwner.userId === userId) {
        countAnswersUser++;
      }
    }

    return { countAnswersUser, countAnswersBoth };
  }
}
