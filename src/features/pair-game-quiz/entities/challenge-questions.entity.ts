import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionsQuizEntity } from './questions-quiz.entity';
import { PairGameQuizEntity } from './pair-game-quiz.entity';

@Entity('ChallengeQuestions')
export class ChallengeQuestionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PairGameQuizEntity, (pairGameQuiz) => pairGameQuiz.questions)
  @JoinColumn({ name: 'pairGameQuizId', referencedColumnName: 'id' })
  pairGameQuiz: PairGameQuizEntity;

  @ManyToOne(
    () => QuestionsQuizEntity,
    (question) => question.challengeQuestion,
  )
  @JoinColumn([
    { name: 'questionId', referencedColumnName: 'id' },
    { name: 'body', referencedColumnName: 'questionText' },
  ])
  question: QuestionsQuizEntity;
}
