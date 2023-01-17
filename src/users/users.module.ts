import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConvertFiltersForDB } from '../infrastructure/common/convert-filters/convertFiltersForDB';
import { Pagination } from '../infrastructure/common/pagination/pagination';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CaslModule } from '../ability/casl.module';
import { UsersRepository } from './infrastructure/users.repository';
import { usersProviders } from './infrastructure/users.providers';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { BlacklistJwtRepository } from '../auth/infrastructure/blacklist-jwt.repository';

@Module({
  imports: [DatabaseModule, CaslModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    Pagination,
    BlacklistJwtRepository,
    AuthService,
    UsersRepository,
    JwtService,
    ConvertFiltersForDB,
    MailsRepository,
    ...usersProviders,
  ],
  exports: [UsersService],
})
export class UsersModule {}
