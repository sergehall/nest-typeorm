import { Injectable } from '@nestjs/common';

@Injectable()
export class KeyResolver {
  async resolveKey(
    key: string,
    options: string[],
    defaultKey: string,
  ): Promise<string> {
    return options.includes(key) ? key : defaultKey;
  }
}
