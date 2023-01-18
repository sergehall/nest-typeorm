import { Injectable } from '@nestjs/common';
import {
  PathFilterEnum,
  PatternConvertFilterType,
} from './enums/filters.enums';
import { QueryArrType } from './types/convert-filter.types';

@Injectable()
export class ConvertFiltersForDB {
  async convert([...rawFilters]: QueryArrType) {
    return this._forMongo([...rawFilters], PathFilterEnum);
  }

  async _forMongo([...rawFilters], pathFilterEnum: PatternConvertFilterType) {
    const convertedFilters = [];
    for (let i = 0, l = Object.keys(rawFilters).length; i < l; i++) {
      for (const key in rawFilters[i]) {
        if (
          pathFilterEnum.hasOwnProperty(key) &&
          rawFilters[i][key].length !== 0
        ) {
          const convertedFilter = {};
          console.log(rawFilters[i][key], 'rawFilters[i][key]');
          if (rawFilters[i][key] === 'true') {
            rawFilters[i][key] = true;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            convertedFilter[pathFilterEnum[key]] = {
              $eq: rawFilters[i][key],
            };
            convertedFilters.push(convertedFilter);
            continue;
          }
          if (rawFilters[i][key] === 'false') {
            rawFilters[i][key] = false;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            convertedFilter[pathFilterEnum[key]] = {
              $eq: rawFilters[i][key],
            };
            convertedFilters.push(convertedFilter);
            continue;
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          convertedFilter[pathFilterEnum[key]] = {
            $regex: rawFilters[i][key].toLowerCase(),
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
  }
}
