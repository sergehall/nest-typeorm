import { SortDirectionEnum } from '../enums/sort-direction.enum';

type FieldType =
  | { avgScores: SortDirectionEnum }
  | { sumScore: SortDirectionEnum }
  | { winsCount: SortDirectionEnum }
  | { lossesCount: SortDirectionEnum };

export type SortType = FieldType[];
