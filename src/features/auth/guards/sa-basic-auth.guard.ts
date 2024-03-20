import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SaConfig } from '../../../config/sa/sa.config';
import {
  loginOrPassInvalid,
  noAuthHeadersError,
} from '../../../common/filters/custom-errors-messages';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../config/configuration';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSaUserCommand } from '../../sa/application/use-cases/sa-create-super-admin.use-case';
import { UsersRepo } from '../../users/infrastructure/users-repo';

@Injectable()
export class SaBasicAuthGuard extends SaConfig implements CanActivate {
  private readonly commandBus: CommandBus;
  private readonly usersRepo: UsersRepo;

  constructor(
    commandBus: CommandBus,
    usersRepo: UsersRepo,
    configService: ConfigService<ConfigType, true>,
  ) {
    super(configService);
    this.commandBus = commandBus; // Assign commandBus to class property
    this.usersRepo = usersRepo;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const expectedBasicAuthInput = await this.getSaValue('BASIC_AUTH');

    const expectedInputAuthorization = `Basic ${expectedBasicAuthInput}`;

    if (!request.headers || !request.headers.authorization) {
      throw new UnauthorizedException([noAuthHeadersError]);
    } else {
      if (request.headers.authorization !== expectedInputAuthorization) {
        throw new HttpException(
          {
            message: [loginOrPassInvalid],
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const saLogin = await this.getSaValue('SA_LOGIN');
      const saUser = await this.usersRepo.findSaUserByLoginOrEmail(saLogin);
      if (saUser) {
        return true;
      }
      request.user = await this.commandBus.execute(new CreateSaUserCommand());
      return true;
    }
  }
}
