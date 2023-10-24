import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { StatusGameEnum } from '../enums/status-game.enum';
import { UsersEntity } from '../../users/entities/users.entity';
import { ChallengeQuestionsEntity } from './challenge-questions.entity';
import { GamesResultsEnum } from '../enums/games-results.enum';
import { ChallengeAnswersEntity } from './challenge-answers.entity';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import * as uuid4 from 'uuid4';
import { PlayersResultDto } from '../dto/players-result.dto';

@Entity('PairsGame')
export class PairsGameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, (user) => user.firstPlayer, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'firstPlayerId', referencedColumnName: 'userId' },
    { name: 'firstPlayerLogin', referencedColumnName: 'login' },
  ])
  firstPlayer: UsersEntity;

  @Column({ default: 0 })
  firstPlayerScore: number;

  @Column({
    type: 'enum',
    enum: GamesResultsEnum,
    default: GamesResultsEnum.DRAW,
  })
  firstPlayerGameResult: GamesResultsEnum;

  @ManyToOne(() => UsersEntity, (user) => user.secondPlayer, {
    eager: true,
    nullable: true,
  })
  @JoinColumn([
    { name: 'secondPlayerId', referencedColumnName: 'userId' },
    { name: 'secondPlayerLogin', referencedColumnName: 'login' },
  ])
  secondPlayer: UsersEntity | null;

  @Column({ default: 0 })
  secondPlayerScore: number;

  @Column({
    type: 'enum',
    enum: GamesResultsEnum,
    default: GamesResultsEnum.DRAW,
  })
  secondPlayerGameResult: GamesResultsEnum;

  @Column({
    type: 'enum',
    enum: StatusGameEnum,
    default: StatusGameEnum.PENDING,
    nullable: false,
  })
  status: StatusGameEnum;

  @Column({ type: 'character varying', length: 50, nullable: false })
  pairCreatedDate: string;

  @Column({ type: 'character varying', length: 50, nullable: true })
  startGameDate: string | null;

  @Column({ type: 'character varying', length: 50, nullable: true })
  finishGameDate: string | null;

  @OneToMany(
    () => ChallengeQuestionsEntity,
    (challengeQuestion) => challengeQuestion.pairGameQuiz,
  )
  questions: ChallengeQuestionsEntity[];

  @OneToMany(
    () => ChallengeAnswersEntity,
    (challengeAnswer) => challengeAnswer.pairGameQuiz,
  )
  answers: ChallengeAnswersEntity[];

  events: any[] = [];

  static createPairsGameEntity(
    currentUserDto: CurrentUserDto,
  ): PairsGameEntity {
    const firstPlayer = new UsersEntity();
    firstPlayer.userId = currentUserDto.userId;
    firstPlayer.login = currentUserDto.login;

    const pairGame = new PairsGameEntity();
    pairGame.id = uuid4();
    pairGame.firstPlayer = firstPlayer;
    pairGame.secondPlayer = null;
    pairGame.pairCreatedDate = new Date().toISOString();
    pairGame.startGameDate = null;
    pairGame.finishGameDate = null;

    return pairGame;
  }

  static addSecondPlayer(
    pairGameQuiz: PairsGameEntity,
    currentUserDto: CurrentUserDto,
  ): PairsGameEntity {
    const secondPlayer = new UsersEntity();
    secondPlayer.userId = currentUserDto.userId;
    secondPlayer.login = currentUserDto.login;

    pairGameQuiz.secondPlayer = secondPlayer;
    pairGameQuiz.startGameDate = new Date().toISOString();
    pairGameQuiz.status = StatusGameEnum.ACTIVE;

    return pairGameQuiz;
  }

  static updateGameResult(
    game: PairsGameEntity,
    playersData: PlayersResultDto,
  ): PairsGameEntity {
    // Update the first player's data
    game.firstPlayer = playersData.firstPlayer.player;
    game.firstPlayerScore = playersData.firstPlayer.sumScore;
    game.firstPlayerGameResult = playersData.firstPlayer.gameResult;

    // Update the second player's data if provided

    game.secondPlayer = playersData.secondPlayer.player;
    game.secondPlayerScore = playersData.secondPlayer.sumScore;
    game.secondPlayerGameResult = playersData.secondPlayer.gameResult;

    return game;
  }
}
