import { IsInt, IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { SortOrder } from '../../parse-query/types/sort-order.types';

export class PaginationDto {
  @IsNotEmpty()
  @IsInt()
  pageNumber: number;
  @IsNotEmpty()
  @IsInt()
  pageSize: number;
  @IsNotEmpty()
  @Length(0, 100, {
    message: 'Incorrect sortBy length! Must be min 0, max 100 ch.',
  })
  sortBy: string;
  @IsNotEmpty()
  @Length(0, 10, {
    message: 'Incorrect sortDirection length! Must be min 1, max 10 ch.',
  })
  @IsNumberString()
  sortDirection: SortOrder;
}
