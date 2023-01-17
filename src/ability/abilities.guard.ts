import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_ABILITY, RequiredRule } from './abilities.decorator';
import { ForbiddenError } from '@casl/ability';
import { Role } from './roles/role.enum';
import { SkipThrottle } from '@nestjs/throttler';

@Injectable()
@SkipThrottle()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules = this.reflector.get<RequiredRule[]>(
      CHECK_ABILITY,
      context.getHandler() || [],
    );
    let { currentUser } = context.switchToHttp().getRequest();
    if (!currentUser) {
      currentUser = { roles: Role.User };
    }
    console.log(currentUser, rules, 'AbilitiesGuard rules');
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    try {
      rules.forEach((rule) =>
        ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject),
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
    return false;
  }
}
