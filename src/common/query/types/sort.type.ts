import { SortDirectionEnum } from '../enums/sort-direction.enum';

// export type SortType = {
//   avgScores: SortDirectionEnum;
//   sumScore: SortDirectionEnum;
//   winsCount?: SortDirectionEnum;
//   lossesCount?: SortDirectionEnum;
// };

type FieldType =
  | { avgScores: SortDirectionEnum }
  | { sumScore: SortDirectionEnum }
  | { winsCount: SortDirectionEnum }
  | { lossesCount: SortDirectionEnum };

export type SortType = FieldType[];

// export type SortType = [
//   { avgScores: SortDirectionEnum },
//   { sumScore: SortDirectionEnum },
//   { winsCount?: SortDirectionEnum },
//   { lossesCount?: SortDirectionEnum },
// ];
