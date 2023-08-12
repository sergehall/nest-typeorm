import { SortDirectionType } from '../../../common/query/types/sort-direction.types';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PagingParamsDto {
  @IsString()
  sortBy: string;
  @IsNotEmpty()
  @IsString()
  direction: SortDirectionType;
  @IsNumber()
  limit: number;
  @IsNumber()
  offset: number;
}
