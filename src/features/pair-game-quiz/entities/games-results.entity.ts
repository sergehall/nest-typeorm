import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GamesResultsEnum } from '../enums/games-results.enum';
import { UsersEntity } from '../../users/entities/users.entity';
import { PairsGameQuizEntity } from './pairs-game-quiz.entity';

@Entity('GamesResults')
export class GamesResultsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  sumScore: number;

  @Column({
    type: 'enum',
    enum: GamesResultsEnum,
    default: GamesResultsEnum.DRAW,
  })
  gameResult: GamesResultsEnum;

  @ManyToOne(
    () => PairsGameQuizEntity,
    (pairGameQuiz) => pairGameQuiz.gameResult,
    {
      nullable: false,
      eager: true,
    },
  )
  @JoinColumn({ name: 'gameId', referencedColumnName: 'id' })
  pairGameQuiz: PairsGameQuizEntity;

  @ManyToOne(() => UsersEntity, (user) => user.gameResult, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([{ name: 'playerId', referencedColumnName: 'userId' }])
  player: UsersEntity;
}
