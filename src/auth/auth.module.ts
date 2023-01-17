import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { authProviders } from './infrastructure/auth.providers';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { SecurityDevicesRepository } from '../security-devices/infrastructure/security-devices.repository';
import { BlacklistJwtRepository } from './infrastructure/blacklist-jwt.repository';

@Module({
  imports: [DatabaseModule, UsersModule, PassportModule, JwtModule],
  controllers: [AuthController],
  providers: [
    BlacklistJwtRepository,
    SecurityDevicesRepository,
    UsersRepository,
    AuthService,
    SecurityDevicesService,
    LocalStrategy,
    JwtStrategy,
    ...authProviders,
  ],
  exports: [AuthService],
})
export class AuthModule {}
