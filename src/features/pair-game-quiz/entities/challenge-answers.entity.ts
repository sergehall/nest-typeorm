import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionsQuizEntity } from './questions-quiz.entity';
import { PairsGameQuizEntity } from './pairs-game-quiz.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { AnswerStatusEnum } from '../enums/answer-status.enum';

@Entity('ChallengeAnswers')
export class ChallengeAnswersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  answer: string;

  @Column({
    type: 'enum',
    enum: AnswerStatusEnum,
  })
  answerStatus: AnswerStatusEnum;

  @Column({ type: 'character varying', length: 50, nullable: false })
  addedAt: string;

  @ManyToOne(
    () => PairsGameQuizEntity,
    (pairGameQuiz) => pairGameQuiz.questions,
    {
      nullable: false,
      eager: true,
    },
  )
  @JoinColumn({ name: 'pairGameQuizId', referencedColumnName: 'id' })
  pairGameQuiz: PairsGameQuizEntity;

  @ManyToOne(
    () => QuestionsQuizEntity,
    (question) => question.challengeQuestion,
    {
      nullable: false,
      eager: true,
    },
  )
  @JoinColumn([
    { name: 'questionId', referencedColumnName: 'id' },
    { name: 'body', referencedColumnName: 'questionText' },
  ])
  question: QuestionsQuizEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'answerOwnerId', referencedColumnName: 'userId' })
  answerOwner: UsersEntity;
}
