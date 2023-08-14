import { IsEnum, IsNumber, IsString } from 'class-validator';
import { SortDirection } from '../../../common/query/dto/parse-queries.dto';

export class PagingParamsDto {
  @IsString()
  sortBy: string;
  @IsEnum(SortDirection)
  direction: SortDirection;
  @IsNumber()
  limit: number;
  @IsNumber()
  offset: number;
}
