import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { AnswerDto } from '../../dto/answer.dto';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
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
import { AddResultGameToDbCommand } from './add-result-game-to-db.use-case';

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
    protected gameQuizRepo: GameQuizRepo,
    protected commandBus: CommandBus,
  ) {}

  async execute({ answerDto, currentUserDto }: SubmitAnswerCommand) {
    const { answer } = answerDto;

    const pairByUserId = await this.gameQuizRepo.getActiveGameByUserId(
      currentUserDto.userId,
    );

    if (!pairByUserId) {
      throw new ForbiddenException(noOpenGameMessage);
    }
    const challengeAnswers: ChallengeAnswersEntity[] =
      await this.gameQuizRepo.getChallengeAnswersByGameId(pairByUserId.id);

    const counts = await this.countsChallengeAnswers(
      challengeAnswers,
      currentUserDto.userId,
    );

    const MAX_ANSWER_COUNT = 5;

    switch (counts.countAnswersUser) {
      case MAX_ANSWER_COUNT:
        throw new ForbiddenException(answeredAllQuestionsMessage);
      default:
        const nextQuestion = await this.gameQuizRepo.getNextChallengeQuestions(
          pairByUserId.id,
          counts.countAnswersUser,
        );
        if (nextQuestion) {
          const verifyAnswer =
            await this.gameQuizRepo.verifyAnswerByQuestionsId(
              nextQuestion.question.id,
              answer,
            );

          const answerStatus = verifyAnswer
            ? AnswerStatusEnum.CORRECT
            : AnswerStatusEnum.INCORRECT;

          const updateChallengeAnswer =
            await this.gameQuizRepo.updateChallengeAnswers(
              counts.countAnswersBoth,
              answer,
              nextQuestion,
              answerStatus,
              currentUserDto,
            );
          if (counts.countAnswersBoth === 9) {
            await this.commandBus.execute(
              new AddResultGameToDbCommand(pairByUserId),
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
