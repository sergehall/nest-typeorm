import { ComplexityEnums } from '../../enums/complexity.enums';

type Question = {
  id: string;
  question: string;
  answer: string;
  topic: string;
  complexity: ComplexityEnums;
};

export type DifficultyDictionary = {
  easy: Question[];
  medium: Question[];
  difficult: Question[];
};
