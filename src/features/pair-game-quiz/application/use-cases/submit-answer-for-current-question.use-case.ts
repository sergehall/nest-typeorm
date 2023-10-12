import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { AnswerDto } from '../../dto/answer.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AnswerStatusEnum } from '../../enums/answer-status.enum';
import {
  answeredAllQuestionsMessage,
  noOpenGameMessage,
} from '../../../../common/filters/custom-errors-messages';
import { ChallengeAnswersEntity } from '../../entities/challenge-answers.entity';
import { AddResultToPairGameCommand } from './add-result-to-pair-game.use-case';
import { GameQuestionsRepo } from '../../infrastructure/game-questions-repo';
import { ChallengesQuestionsRepo } from '../../infrastructure/challenges-questions-repo';
import { ChallengesAnswersRepo } from '../../infrastructure/challenges-answers-repo';
import { PairsGameRepo } from '../../infrastructure/game-quiz-repo';
import { AnswerViewModel } from '../../models/answer-view.model';

export class SubmitAnswerCommand {
  constructor(
    public answerDto: AnswerDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(SubmitAnswerCommand)
export class SubmitAnswerForCurrentQuestionUseCase
  implements ICommandHandler<SubmitAnswerCommand>
{
  constructor(
    protected pairsGameRepo: PairsGameRepo,
    protected gameQuestionsRepo: GameQuestionsRepo,
    protected challengesQuestionsRepo: ChallengesQuestionsRepo,
    protected challengesAnswersRepo: ChallengesAnswersRepo,
    protected commandBus: CommandBus,
  ) {}

  async execute({
    answerDto,
    currentUserDto,
  }: SubmitAnswerCommand): Promise<AnswerViewModel> {
    const { answer } = answerDto;

    const pairByUserId = await this.pairsGameRepo.getActiveGameByUserId(
      currentUserDto.userId,
    );

    if (!pairByUserId) {
      throw new ForbiddenException(noOpenGameMessage);
    }
    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.challengesAnswersRepo.getChallengeAnswersByGameId(
        pairByUserId.id,
      );

    const counts = await this.countsChallengeAnswers(
      challengeAnswers,
      currentUserDto.userId,
    );

    const MAX_ANSWER_COUNT = 5;

    switch (counts.countAnswersUser) {
      case MAX_ANSWER_COUNT:
        throw new ForbiddenException(answeredAllQuestionsMessage);
      default:
        const nextQuestion =
          await this.challengesQuestionsRepo.getNextChallengeQuestions(
            pairByUserId.id,
            counts.countAnswersUser,
          );
        if (nextQuestion) {
          const verifyAnswer =
            await this.gameQuestionsRepo.verifyAnswerByQuestionsId(
              nextQuestion.question.id,
              answer,
            );

          const answerStatus = verifyAnswer
            ? AnswerStatusEnum.CORRECT
            : AnswerStatusEnum.INCORRECT;

          const updateChallengeAnswer =
            await this.challengesAnswersRepo.updateChallengeAnswers(
              counts.countAnswersBoth,
              answer,
              nextQuestion,
              answerStatus,
              currentUserDto,
            );

          let currentAnswer: number = 0;
          if (updateChallengeAnswer) {
            currentAnswer = 1;
          }

          if (counts.countAnswersBoth + currentAnswer === 10) {
            await this.commandBus.execute(
              new AddResultToPairGameCommand(pairByUserId),
            );
          }
          return {
            questionId: updateChallengeAnswer.question.id,
            answerStatus: updateChallengeAnswer.answerStatus,
            addedAt: updateChallengeAnswer.addedAt,
          };
        }

        throw new InternalServerErrorException(
          'Failed with AnswerForCurrentQuestionUseCase.',
        );
    }
  }

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
