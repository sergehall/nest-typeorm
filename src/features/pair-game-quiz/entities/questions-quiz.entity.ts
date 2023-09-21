import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from 'typeorm';
import { ComplexityEnums } from '../enums/complexity.enums';
import { PairGameQuizEntity } from './pair-game-quiz.entity';
import { GameChallengesEntity } from './game-challenges.entity';

@Entity('QuestionsQuiz')
@Unique(['id', 'questionText'])
export class QuestionsQuizEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: 600,
    nullable: false,
  })
  questionText: string;

  @Column({
    type: 'character varying',
    length: 20,
    nullable: false,
  })
  hashAnswer: string;

  @Column({
    type: 'enum',
    enum: ComplexityEnums,
    default: ComplexityEnums.EASY,
    nullable: false,
  })
  complexity: ComplexityEnums;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  topic: string;

  @OneToMany(() => PairGameQuizEntity, (pairGame) => pairGame.id)
  pairGame: PairGameQuizEntity;

  @OneToMany(
    () => GameChallengesEntity,
    (gameChallenge) => gameChallenge.question,
  )
  gameChallenge: GameChallengesEntity;
}
