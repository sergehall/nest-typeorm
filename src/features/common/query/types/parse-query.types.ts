// Type for the parsed query parameters
import { QueryPaginationType } from './query-pagination-types';
import { BanConditionType } from './ban-condition.types';

export type ParseQueriesType = {
  title: string;
  userName: string;
  searchTitle: string;
  searchNameTerm: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
  code: string;
  confirmationCode: string;
  queryPagination: QueryPaginationType;
  banStatus: BanConditionType;
};
