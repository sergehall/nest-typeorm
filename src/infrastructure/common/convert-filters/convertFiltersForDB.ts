import { Injectable } from '@nestjs/common';
import {
  PathFilterEnum,
  PatternConvertFilterType,
} from './enums/filters.enums';
import { QueryArrType } from './types/convert-filter.types';

@Injectable()
export class ConvertFiltersForDB {
  async convert(queryFilters: QueryArrType) {
    return this._forMongo(queryFilters, PathFilterEnum);
  }

  async _forMongo(queryFilters: any, pathFilterEnum: PatternConvertFilterType) {
    const convertedFilters = [];
    try {
      for (let i = 0, l = Object.keys(queryFilters).length; i < l; i++) {
        for (const key in queryFilters[i]) {
          if (pathFilterEnum.hasOwnProperty(key) && queryFilters[i][key]) {
            const convertedFilter = {};
            if (key === 'banStatus' && queryFilters[i][key] === 'true') {
              queryFilters[i][key] = true;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              convertedFilter[pathFilterEnum[key]] = {
                $eq: queryFilters[i][key],
              };
              convertedFilters.push(convertedFilter);
              continue;
            }
            if (key === 'banStatus' && queryFilters[i][key] === 'false') {
              queryFilters[i][key] = false;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              convertedFilter[pathFilterEnum[key]] = {
                $eq: queryFilters[i][key],
              };
              convertedFilters.push(convertedFilter);
              continue;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            convertedFilter[pathFilterEnum[key]] = {
              $regex: queryFilters[i][key].toLowerCase(),
              $options: 'i',
            };
            convertedFilters.push(convertedFilter);
          }
        }
      }
      if (convertedFilters.length === 0) {
        convertedFilters.push({});
      }
      return convertedFilters;
    } catch (err) {
      console.log(err);
      return [{}];
    }
  }
}
