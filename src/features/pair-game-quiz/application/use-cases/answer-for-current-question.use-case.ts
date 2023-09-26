import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { AnswerDto } from '../../dto/answer.dto';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { ForbiddenException } from '@nestjs/common';
import { PairAndQuestionsDto } from '../../dto/pair-questions.dto';
import { ChallengeQuestionsEntity } from '../../entities/challenge-questions.entity';
import { AnswerStatusEnum } from '../../enums/answer-status.enum';

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

  async execute(command: AnswerToCurrentQuestionCommand) {
    const { answerDto, currentUserDto } = command;
    const { answer } = answerDto;

    const game: PairsGameQuizEntity | null =
      await this.gameQuizRepo.getCurrentGameByUserId(currentUserDto.userId);

    await this.checkPermission(game);

    const pairAndQuestionsDto: PairAndQuestionsDto | null =
      await this.gameQuizRepo.getNextQuestionsToGame(game!, currentUserDto);

    if (pairAndQuestionsDto.challengeQuestions.length === 5) {
      throw new ForbiddenException('The user answered all the questions.');
    }

    let answerStatus = AnswerStatusEnum.INCORRECT;

    const nextChallengeQuestion: ChallengeQuestionsEntity =
      pairAndQuestionsDto.challengeQuestions[0];

    const verifyAnswer = await this.gameQuizRepo.verifyAnswerByQuestionsId(
      nextChallengeQuestion.question.id,
      answer,
    );
    if (verifyAnswer) {
      answerStatus = AnswerStatusEnum.CORRECT;
    }

    const updateChallengeAnswer =
      await this.gameQuizRepo.updateChallengeAnswers(
        answer,
        nextChallengeQuestion,
        answerStatus,
        currentUserDto,
      );

    return {
      questionId: updateChallengeAnswer.question.id,
      answerStatus: updateChallengeAnswer.answerStatus,
      addedAt: updateChallengeAnswer.addedAt,
    };
  }

  private async checkPermission(
    game: PairsGameQuizEntity | null,
  ): Promise<void> {
    if (!game) {
      throw new ForbiddenException('The user has no open, unfinished games.');
    }
  }
}
