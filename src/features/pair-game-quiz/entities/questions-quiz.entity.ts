import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from 'typeorm';
import { ComplexityEnums } from '../enums/complexity.enums';
import { ChallengeQuestionsEntity } from './challenge-questions.entity';
import { PairsGameQuizEntity } from './pairs-game-quiz.entity';

@Entity('QuestionsQuiz')
@Unique(['id', 'questionText'])
export class QuestionsQuizEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: 500,
    nullable: false,
  })
  questionText: string;

  @Column({
    type: 'character varying',
    array: true,
    default: [],
  })
  hashedAnswers: string[];

  @Column({ default: false, nullable: false })
  published: boolean;

  @Column({ type: 'character varying', nullable: false })
  createdAt: string;

  @Column({ type: 'character varying', nullable: true, default: null })
  updatedAt: string | null = null;

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
    default: 'Еhe topic is not defined',
  })
  topic: string;

  @OneToMany(() => PairsGameQuizEntity, (pairGame) => pairGame.id)
  pairGame: PairsGameQuizEntity;

  @OneToMany(
    () => ChallengeQuestionsEntity,
    (gameChallenge) => gameChallenge.question,
  )
  challengeQuestion: ChallengeQuestionsEntity[];
}
