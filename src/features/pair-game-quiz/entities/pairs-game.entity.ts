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
}
