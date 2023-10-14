import { SortDirectionEnum } from '../enums/sort-direction.enum';

export type SortType = {
  avgScores: SortDirectionEnum;
  sumScore: SortDirectionEnum;
  winsCount?: SortDirectionEnum;
  lossesCount?: SortDirectionEnum;
};
