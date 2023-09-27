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

@Entity('PairsGameQuiz')
export class PairsGameQuizEntity {
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

  @ManyToOne(() => UsersEntity, (user) => user.secondPlayer, {
    eager: true,
    nullable: true,
  })
  @JoinColumn([
    { name: 'secondPlayerId', referencedColumnName: 'userId' },
    { name: 'secondPlayerLogin', referencedColumnName: 'login' },
  ])
  secondPlayer: UsersEntity | null;

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
}
