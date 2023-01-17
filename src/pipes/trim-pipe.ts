import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform<object, object> {
  transform(value: object | string, metadata: ArgumentMetadata): any {
    const trimPair = (acc: object, [k, v]: [string, any]) => ({
      ...acc,
      [k]: typeof v === 'string' ? v.trim() : v,
    });
    if (typeof value === 'string') {
      return value.trim();
    }
    return Object.entries(value).reduce(trimPair, {});
  }
}
