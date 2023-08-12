import { Injectable } from '@nestjs/common';

@Injectable()
export class KeyArrayProcessor {
  async getKeyFromArrayOrDefault(
    key: string,
    arrNames: string[],
    defaultName: string,
  ): Promise<string> {
    if (arrNames.includes(key)) {
      return key;
    } else {
      return defaultName;
    }
  }
}
