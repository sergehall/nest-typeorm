import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SaConfig } from '../../../config/sa/sa.config';
import { UsersRepo } from '../../users/infrastructure/users-repo';
import { CreateSaUserCommand } from './use-cases/sa-create-super-admin.use-case';

@Injectable()
export class SaUserBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SaUserBootstrapService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersRepo: UsersRepo,
    private readonly saConfig: SaConfig,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const saLogin = await this.saConfig.getSaValue('SA_LOGIN');
    const existingSaUser = await this.usersRepo.findSaUserByLoginOrEmail(saLogin);

    if (!existingSaUser) {
      await this.commandBus.execute(new CreateSaUserCommand());
      this.logger.log('The configured super-admin account was initialized.');
    }
  }
}
