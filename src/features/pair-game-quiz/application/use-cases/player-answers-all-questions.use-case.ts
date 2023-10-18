import { PairsGameEntity } from '../../entities/pairs-game.entity';
import { ICommandHandler } from '@nestjs/cqrs';
import { StatusGameEnum } from '../../enums/status-game.enum';
import { GamePairsRepo } from '../../infrastructure/game-pairs.repo';

export class PlayerAnswersAllQuestionsCommand {
  constructor(public game: PairsGameEntity) {}
}

export class PlayerAnswersAllQuestionsUseCase
  implements ICommandHandler<PlayerAnswersAllQuestionsCommand>
{
  constructor(protected gamePairsRepo: GamePairsRepo) {}

  async execute(command: PlayerAnswersAllQuestionsCommand): Promise<boolean> {
    const { game } = command;
    const TEN_SECONDS = 10000; // 10 seconds in milliseconds

    return new Promise<boolean>((resolve) => {
      setTimeout(async () => {
        // Timer has expired, update the game status and finishGameDate.
        game.status = StatusGameEnum.FINISHED;
        game.finishGameDate = new Date().toISOString();
        await this.gamePairsRepo.saveGame(game);

        // Call the method to check unanswered questions by the second user.
        await this.checkUnansweredQuestionsBySecondUser(game);

        resolve(true); // Resolve the promise when the changes are saved and questions are checked.
      }, TEN_SECONDS);
    });
  }

  // New method to check unanswered questions by the second user.
  private async checkUnansweredQuestionsBySecondUser(game: PairsGameEntity) {
    if (game.secondPlayer) {
      // Assuming you have a way to retrieve unanswered questions.
      // const unansweredQuestions =
      //   await this.gamePairsRepo.getUnansweredQuestions(game.secondPlayer);
      // Do something with unansweredQuestions (e.g., notify the second user).
    }
  }
}
