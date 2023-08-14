import { IsString, IsNumber, IsEnum } from 'class-validator';

export type BanCondition = boolean[];

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryPagination {
  @IsNumber()
  pageNumber: number;

  @IsNumber()
  pageSize: number;

  @IsString()
  sortBy: string;

  @IsEnum(SortDirection)
  sortDirection: SortDirection;
}

export class ParseQueriesDto {
  @IsString()
  title: string;

  @IsString()
  userName: string;

  @IsString()
  code: string;

  @IsString()
  confirmationCode: string;

  @IsString()
  searchTitle: string;

  @IsString()
  searchNameTerm: string;

  @IsString()
  searchLoginTerm: string;

  @IsString()
  searchEmailTerm: string;

  @IsNumber()
  queryPagination: QueryPagination;

  banStatus: BanCondition;
}
