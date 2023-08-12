import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform<any, any> {
  transform(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    } else if (typeof value === 'object') {
      return this.trimObjectValues(value);
    }
    return value;
  }

  private trimObjectValues(obj: any): any {
    return Object.entries(obj).reduce((acc, [key, val]) => {
      return {
        ...acc,
        [key]: typeof val === 'string' ? val.trim() : val,
      };
    }, {});
  }
}
