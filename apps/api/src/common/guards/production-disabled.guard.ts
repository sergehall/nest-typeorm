import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { isHardenedRuntime } from '../environment/runtime-environment';

/**
 * Keeps educational mutation routes available for local study while ensuring
 * they cannot be invoked against the deployed production database.
 */
@Injectable()
export class ProductionDisabledGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    if (isHardenedRuntime()) {
      throw new NotFoundException();
    }

    return true;
  }
}
