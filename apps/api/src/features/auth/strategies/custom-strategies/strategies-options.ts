import { Injectable } from '@nestjs/common';
import { JwtAndActiveGameStrategy } from '../jwt-and-active-game.strategy';

interface CustomStrategy {
  name: string;
  strategy: typeof JwtAndActiveGameStrategy;
}

interface StrategiesOptionsType {
  customStrategies: CustomStrategy[];
}

@Injectable()
export class StrategiesOptions {
  static getStrategies(): StrategiesOptionsType {
    return {
      customStrategies: [
        {
          name: 'jwt-active-game',
          strategy: JwtAndActiveGameStrategy,
        },
      ],
    };
  }
}
