import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { QuestionsQuizEntity } from '../../sa-quiz-questions/entities/questions-quiz.entity';
import { PairsGameQuizEntity } from './pairs-game-quiz.entity';

@Entity('ChallengeQuestions')
export class ChallengeQuestionsEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  createdAt: string;

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
}
