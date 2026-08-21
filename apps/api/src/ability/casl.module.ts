import { CaslAbilityFactory } from './casl-ability.factory';
import { Module } from '@nestjs/common';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
