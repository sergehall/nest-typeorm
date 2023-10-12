import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { QuestionsQuizEntity } from '../../sa-quiz-questions/entities/questions-quiz.entity';
import { PairsGameEntity } from './pairs-game.entity';

@Entity('ChallengeQuestions')
export class ChallengeQuestionsEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  createdAt: string;

  @ManyToOne(() => PairsGameEntity, (pairGameQuiz) => pairGameQuiz.questions, {
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
}
