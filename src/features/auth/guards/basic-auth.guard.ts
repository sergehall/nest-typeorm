import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { noAuthHeadersError } from '../../../common/filters/custom-errors-messages';
import { UsersEntity } from '../../users/entities/users.entity';
import { CommandBus } from '@nestjs/cqrs';
import { ValidLoginOrEmailPasswordCommand } from '../application/use-cases/valid-login-or-email-password.use-case';
import { ValidLoginPasswordSizesCommand } from '../application/use-cases/valid-login-password-sizes.use-case';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly commandBus: CommandBus) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException([noAuthHeadersError]);
    }

    const authorizationHeader = request.headers.authorization;

    const [, base64Credentials] = authorizationHeader.split(' ');

    if (!base64Credentials) {
      throw new UnauthorizedException([noAuthHeadersError]);
    }

    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );

    const [username, password] = credentials.split(':');

    await this.commandBus.execute(
      new ValidLoginPasswordSizesCommand(username, password),
    );

    const user: UsersEntity = await this.commandBus.execute(
      new ValidLoginOrEmailPasswordCommand(username, password),
    );

    request.user = {
      userId: user.userId,
      login: user.login,
      email: user.email,
      orgId: user.orgId,
      roles: user.roles,
      isBanned: user.isBanned,
    };

    return true; // Return true if authentication succeeds
  }
}
