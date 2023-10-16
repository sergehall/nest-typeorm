import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { QuestionsQuizEntity } from '../../sa-quiz-questions/entities/questions-quiz.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { AnswerStatusEnum } from '../enums/answer-status.enum';
import { PairsGameEntity } from './pairs-game.entity';

@Entity('ChallengeAnswers')
export class ChallengeAnswersEntity {
  @PrimaryColumn('uuid')
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

  @ManyToOne(() => PairsGameEntity, (pairGameQuiz) => pairGameQuiz.answers, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'pairGameQuizId', referencedColumnName: 'id' })
  pairGameQuiz: PairsGameEntity;

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
