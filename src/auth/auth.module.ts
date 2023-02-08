import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './application/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { authProviders } from './infrastructure/auth.providers';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';
import { BlacklistJwtRepository } from './infrastructure/blacklist-jwt.repository';
import { JwtConfig } from '../config/jwt/jwt-config';
import { MailsRepository } from '../mails/infrastructure/mails.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUserUseCase } from './application/use-cases/registration-user.use-case';
import { CreateUserByInstanceUseCase } from '../users/application/use-cases/create-user-byInstance.use-case';

const authCases = [CreateUserByInstanceUseCase, RegistrationUserUseCase];

@Module({
  imports: [DatabaseModule, UsersModule, PassportModule, JwtModule, CqrsModule],
  controllers: [AuthController],
  providers: [
    BlacklistJwtRepository,
    SecurityDevicesRepository,
    JwtConfig,
    UsersRepository,
    AuthService,
    SecurityDevicesService,
    LocalStrategy,
    JwtStrategy,
    MailsRepository,
    ...authCases,
    ...authProviders,
  ],
  exports: [AuthService],
})
export class AuthModule {}
