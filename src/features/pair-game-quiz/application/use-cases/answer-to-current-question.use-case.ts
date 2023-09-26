import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CurrentUserDto } from '../../../users/dto/currentUser.dto';
import { AnswerDto } from '../../dto/answer.dto';
import { PairsGameQuizEntity } from '../../entities/pairs-game-quiz.entity';
import { GameQuizRepo } from '../../infrastructure/game-quiz-repo';
import { MapPairGame } from '../../common/map-pair-game-entity-to-game-model';
import { ForbiddenException } from '@nestjs/common';

export class AnswerToCurrentQuestionCommand {
  constructor(
    public answerDto: AnswerDto,
    public currentUserDto: CurrentUserDto,
  ) {}
}

@CommandHandler(AnswerToCurrentQuestionCommand)
export class AnswerToCurrentQuestionUseCase
  implements ICommandHandler<AnswerToCurrentQuestionCommand>
{
  constructor(
    protected gameQuizRepo: GameQuizRepo,
    protected mapPairGame: MapPairGame,
  ) {}

  async execute(command: AnswerToCurrentQuestionCommand) {
    const { answerDto, currentUserDto } = command;

    await this.checkPermission(currentUserDto);

    return true;
  }

  private async checkPermission(currentUserDto: CurrentUserDto): Promise<void> {
    const game: PairsGameQuizEntity | null =
      await this.gameQuizRepo.getGameByUserId(currentUserDto.userId);
    console.log(game);
    if (game) {
      throw new ForbiddenException(
        'The current player is already involved in an ongoing active game pairing.',
      );
    }
  }
}
