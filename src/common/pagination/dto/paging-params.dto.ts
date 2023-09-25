import { IsEnum, IsNumber, IsString } from 'class-validator';
import { SortDirectionEnum } from '../../query/enums/sort-direction.enum';

export class PagingParamsDto {
  @IsString()
  sortBy: string;
  @IsEnum(SortDirectionEnum)
  direction: SortDirectionEnum;
  @IsNumber()
  limit: number;
  @IsNumber()
  offset: number;
}
