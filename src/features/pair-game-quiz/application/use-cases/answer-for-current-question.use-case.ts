import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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

export class AnswerToCurrentQuestionCommand {
  constructor(
    public answerDto: AnswerDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(AnswerToCurrentQuestionCommand)
export class AnswerForCurrentQuestionUseCase
  implements ICommandHandler<AnswerToCurrentQuestionCommand>
{
  constructor(protected gameQuizRepo: GameQuizRepo) {}

  async execute({ answerDto, currentUserDto }: AnswerToCurrentQuestionCommand) {
    const { answer } = answerDto;

    const pairByUserId = await this.gameQuizRepo.getCurrentGameByUserId(
      currentUserDto.userId,
    );
    if (!pairByUserId) {
      throw new ForbiddenException(noOpenGameMessage);
    }

    const challengeAnswersCount =
      await this.gameQuizRepo.getChallengeAnswersCount(
        pairByUserId.id,
        currentUserDto.userId,
      );

    const MAX_ANSWER_COUNT = 5;

    switch (challengeAnswersCount.countAnswers) {
      case MAX_ANSWER_COUNT:
        throw new ForbiddenException(answeredAllQuestionsMessage);
      default:
        const nextQuestion = await this.gameQuizRepo.getNextChallengeQuestions(
          pairByUserId.id,
          challengeAnswersCount.countAnswers,
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
              answer,
              nextQuestion,
              answerStatus,
              currentUserDto,
            );

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
}
// async execute(command: AnswerToCurrentQuestionCommand) {
//   const { answerDto, currentUserDto } = command;
//   const { answer } = answerDto;
//
//   // const pairByUserId: PairsGameQuizEntity | null =
//   //   await this.gameQuizRepo.getCurrentGameByUserId(currentUserDto.userId);
//   //
//   // if (!pairByUserId) {
//   //   throw new ForbiddenException('The user has no open, unfinished games.');
//   // }
//
//   const pairByUserId = await this.gameQuizRepo.getCurrentGameByUserId(
//     currentUserDto.userId,
//   );
//   if (!pairByUserId) {
//     throw new ForbiddenException('NO_OPEN_GAMES_MESSAGE');
//   }
//   const getCountAnswers = await this.gameQuizRepo.getCountAnswers(
//     pairByUserId.id,
//     currentUserDto.userId,
//   );
//
//   const MAX_ANSWER_COUNT = 5;
//
//   // const getCountAnswers: number = await this.gameQuizRepo.getCountAnswers(
//   //   pairByUserId.id,
//   //   currentUserDto.userId,
//   // );
//   //
//   // if (getCountAnswers === 5) {
//   //   throw new ForbiddenException('The user answered all the questions.');
//   // }
//
//   const nextQuestion: ChallengeQuestionsEntity | null =
//     await this.gameQuizRepo.getNextChallengeQuestions(
//       pairByUserId.id,
//       getCountAnswers,
//     );
//
//   console.log(nextQuestion, 'nextQuestion');
//
//   if (nextQuestion) {
//     const verifyAnswer = await this.gameQuizRepo.verifyAnswerByQuestionsId(
//       nextQuestion.question.id,
//       answer,
//     );
//
//     const answerStatus = verifyAnswer
//       ? AnswerStatusEnum.CORRECT
//       : AnswerStatusEnum.INCORRECT;
//
//     const updateChallengeAnswer =
//       await this.gameQuizRepo.updateChallengeAnswers(
//         answer,
//         nextQuestion,
//         answerStatus,
//         currentUserDto,
//       );
//     return {
//       questionId: updateChallengeAnswer.question.id,
//       answerStatus: updateChallengeAnswer.answerStatus,
//       addedAt: updateChallengeAnswer.addedAt,
//     };
//   }
//
//   throw new InternalServerErrorException(
//     'Failed with AnswerForCurrentQuestionUseCase.',
//   );
// }
// }

// @CommandHandler(AnswerToCurrentQuestionCommand)
// export class AnswerForCurrentQuestionUseCase
//   implements ICommandHandler<AnswerToCurrentQuestionCommand>
// {
//   constructor(protected gameQuizRepo: GameQuizRepo) {}
//
//   async execute(command: AnswerToCurrentQuestionCommand) {
//     const { answerDto, currentUserDto } = command;
//     const { answer } = answerDto;
//
//     const pairByUserId: PairsGameQuizEntity | null =
//       await this.gameQuizRepo.getCurrentGameByUserId(currentUserDto.userId);
//
//     if (!pairByUserId) {
//       throw new ForbiddenException('The user has no open, unfinished games.');
//     }
//
//     const getCountAnswers: number = await this.gameQuizRepo.getCountAnswers(
//       pairByUserId.id,
//       currentUserDto.userId,
//     );
//     console.log(getCountAnswers, 'getCountAnswers');
//     if (getCountAnswers === 5) {
//       throw new ForbiddenException('The user answered all the questions.');
//     }
//
//     const getNextChallengeQuestions: QuestionsQuizEntity | null =
//       await this.gameQuizRepo.getNextChallengeQuestions(
//         pairByUserId.id,
//         getCountAnswers,
//       );
//
//     console.log(getNextChallengeQuestions, 'getNextChallengeQuestions');
//
//     const pairAndQuestionsDto: PairAndQuestionsDto | null =
//       await this.gameQuizRepo.getNextQuestionsToGame(
//         pairByUserId,
//         currentUserDto,
//       );
//
//     if (pairAndQuestionsDto.challengeQuestions.length === 5) {
//       throw new ForbiddenException('The user answered all the questions.');
//     }
//
//     let answerStatus = AnswerStatusEnum.INCORRECT;
//
//     const nextChallengeQuestion: ChallengeQuestionsEntity =
//       pairAndQuestionsDto.challengeQuestions[0];
//
//     const verifyAnswer = await this.gameQuizRepo.verifyAnswerByQuestionsId(
//       nextChallengeQuestion.question.id,
//       answer,
//     );
//     if (verifyAnswer) {
//       answerStatus = AnswerStatusEnum.CORRECT;
//     }
//
//     const updateChallengeAnswer =
//       await this.gameQuizRepo.updateChallengeAnswers(
//         answer,
//         nextChallengeQuestion,
//         answerStatus,
//         currentUserDto,
//       );
//
//     return {
//       questionId: updateChallengeAnswer.question.id,
//       answerStatus: updateChallengeAnswer.answerStatus,
//       addedAt: updateChallengeAnswer.addedAt,
//     };
//   }
// }
