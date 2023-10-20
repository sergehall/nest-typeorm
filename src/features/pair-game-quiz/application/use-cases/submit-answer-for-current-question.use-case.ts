import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
import { AddResultToPairGameCommand } from './add-result-to-pair-game.use-case';
import { GameQuestionsRepo } from '../../infrastructure/game-questions.repo';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions.repo';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers.repo';
import { AnswerViewModel } from '../../view-models/answer.view-model';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';
import { PlayerAnswersAllQuestionsCommand } from './player-answers-all-questions.use-case';
import { CurrentUserAndActiveGameDto } from '../../../users/dto/current-user-and-active-game.dto';

export class SubmitAnswerCommand {
  constructor(
    public answerDto: AnswerDto,
    public currentUserDto: CurrentUserAndActiveGameDto,
  ) {}
}

@CommandHandler(SubmitAnswerCommand)
export class SubmitAnswerForCurrentQuestionUseCase
  implements ICommandHandler<SubmitAnswerCommand>
{
  constructor(
    protected pairsGameRepo: GamePairsRepo,
    protected gameQuestionsRepo: GameQuestionsRepo,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
    protected challengesAnswersRepo: ChallengesAnswersRepo,
    protected commandBus: CommandBus,
  ) {}

  async execute(command: SubmitAnswerCommand): Promise<AnswerViewModel> {
    const { answerDto, currentUserDto } = command;
    const { activeGame } = currentUserDto;

    // const pairGame = await this.pairsGameRepo.getActiveGameByUserId(
    //   currentUserDto.userId,
    // );
    //
    // if (!pairGame) {
    //   throw new ForbiddenException(noOpenGameMessage);
    // }

    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getChallengeAnswersByGameId(
        activeGame.id,
      );

    const counts: { countAnswersUser: number; countAnswersBoth: number } =
      await this.countsChallengeAnswers(
        challengeAnswers,
        currentUserDto.userId,
      );

    const MAX_ANSWER_COUNT = 5;
    const MAX_ANSWER_BOTH_COUNT = 10;

    switch (counts.countAnswersUser) {
      case MAX_ANSWER_COUNT:
        throw new ForbiddenException(answeredAllQuestionsMessage);
      default:
        const nextQuestion =
          await this.challengesQuestionsRepo.getNextChallengeQuestions(
            activeGame.id,
            counts.countAnswersUser,
          );

        if (!nextQuestion) {
          throw new ForbiddenException(notFoundChallengeQuestions);
        } else if (nextQuestion) {
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

            if (counts.countAnswersUser + currentAnswer === MAX_ANSWER_COUNT) {
              await this.commandBus.execute(
                new PlayerAnswersAllQuestionsCommand(
                  activeGame,
                  currentUserDto,
                ),
              );
            }

            if (
              counts.countAnswersBoth + currentAnswer ===
              MAX_ANSWER_BOTH_COUNT
            ) {
              await this.commandBus.execute(
                new AddResultToPairGameCommand(activeGame),
              );
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

  // async execute(command: SubmitAnswerCommand): Promise<AnswerViewModel> {
  //   const { answerDto, currentUserDto } = command;
  //
  //   const pairByUserId = await this.pairsGameRepo.getActiveGameByUserId(
  //     currentUserDto.userId,
  //   );
  //
  //   if (!pairByUserId) {
  //     throw new ForbiddenException(noOpenGameMessage);
  //   }
  //   const challengeAnswers: ChallengeAnswersEntity[] =
  //     await this.challengesAnswersRepo.getChallengeAnswersByGameId(
  //       pairByUserId.id,
  //     );
  //
  //   const counts: { countAnswersUser: number; countAnswersBoth: number } =
  //     await this.countsChallengeAnswers(
  //       challengeAnswers,
  //       currentUserDto.userId,
  //     );
  //
  //   const MAX_ANSWER_COUNT = 5;
  //   const COUNT_DIFFERENCE = counts.countAnswersBoth - counts.countAnswersUser;
  //
  //   if (counts.countAnswersUser === MAX_ANSWER_COUNT) {
  //     throw new ForbiddenException(answeredAllQuestionsMessage);
  //   } else if (COUNT_DIFFERENCE >= 5) {
  //     throw new ForbiddenException(theGameIsOver);
  //   } else {
  //     const nextQuestion =
  //       await this.challengesQuestionsRepo.getNextChallengeQuestions(
  //         pairByUserId.id,
  //         counts.countAnswersUser,
  //       );
  //
  //     if (nextQuestion) {
  //       const verifyAnswer =
  //         await this.gameQuestionsRepo.verifyAnswerByQuestionsId(
  //           nextQuestion.question.id,
  //           answerDto.answer,
  //         );
  //
  //       const answerStatus = verifyAnswer
  //         ? AnswerStatusEnum.CORRECT
  //         : AnswerStatusEnum.INCORRECT;
  //
  //       const saveChallengeAnswer =
  //         await this.challengesAnswersRepo.saveChallengeAnswer(
  //           answerDto.answer,
  //           nextQuestion,
  //           answerStatus,
  //           currentUserDto,
  //         );
  //
  //       if (saveChallengeAnswer) {
  //         const currentAnswer = 1;
  //
  //         if (counts.countAnswersUser + currentAnswer === 5) {
  //           await this.commandBus.execute(
  //             new PlayerAnswersAllQuestionsCommand(
  //               pairByUserId,
  //               currentUserDto,
  //             ),
  //           );
  //         }
  //
  //         if (counts.countAnswersBoth + currentAnswer === 10) {
  //           await this.commandBus.execute(
  //             new AddResultToPairGameCommand(pairByUserId),
  //           );
  //         }
  //         return {
  //           questionId: saveChallengeAnswer.question.id,
  //           answerStatus: saveChallengeAnswer.answerStatus,
  //           addedAt: saveChallengeAnswer.addedAt,
  //         };
  //       }
  //     }
  //
  //     throw new InternalServerErrorException(
  //       'Failed with AnswerForCurrentQuestionUseCase.',
  //     );
  //   }
  // }

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
