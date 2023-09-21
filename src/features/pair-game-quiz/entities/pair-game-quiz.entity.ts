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
import { GameChallengesEntity } from './game-challenges.entity';

@Entity('PairGameQuiz')
export class PairGameQuizEntity {
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

  @OneToMany(
    () => GameChallengesEntity,
    (gameChallenge) => gameChallenge.question,
  )
  questions: GameChallengesEntity[];

  @Column({
    type: 'enum',
    enum: StatusGameEnum,
    default: StatusGameEnum.PENDING,
    nullable: false,
  })
  status: StatusGameEnum;

  @Column({ type: 'character varying', length: 50, nullable: false })
  pairCreatedDate: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  startGameDate: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  finishGameDate: string;
}

// @Entity('PairGameQuiz)
// export class PairGameQuizEntity {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;
//
//   @Column('jsonb', { default: {} })
//   firstPlayerProgress: {
//     answers: {
//       questionId: string;
//       answerStatus: string;
//       addedAt: string;
//     }[];
//     player: {
//       id: string;
//       login: string;
//     };
//     score: number;
//   };
//
//   @Column('jsonb', { default: {} })
//   secondPlayerProgress: {
//     answers: {
//       questionId: string;
//       answerStatus: string;
//       addedAt: string;
//     }[];
//     player: {
//       id: string;
//       login: string;
//     };
//     score: number;
//   };
//
//   @Column('jsonb', { default: [] })
//   questions: {
//     id: string;
//     body: string;
//   }[];
//
//   @Column({
//     type: 'enum',
//     enum: StatusGameEnum,
//     default: StatusGameEnum.PENDING,
//     nullable: false,
//   })
//   status: StatusGameEnum;
//
//   @Column({ type: 'character varying', length: 50, nullable: false })
//   pairCreatedDate: string;
//
//   @Column({ type: 'character varying', length: 50, nullable: false })
//   startGameDate: string;
//
//   @Column({ type: 'character varying', length: 50, nullable: false })
//   finishGameDate: string;
// }
