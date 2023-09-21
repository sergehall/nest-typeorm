import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ComplexityEnums } from '../enums/complexity.enums';

@Entity('QuestionsQuiz')
export class QuestionsQuizEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: 600,
    nullable: false,
  })
  question: string;

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
}
