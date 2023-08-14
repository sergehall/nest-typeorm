import { Module } from '@nestjs/common';
import { SecurityDevicesService } from './application/security-devices.service';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersService } from '../users/application/users.service';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { RemoveDevicesBannedUserUseCase } from './application/use-cases/remove-devices-banned-user.use-case';
import { CreateDeviceUseCase } from './application/use-cases/create-device.use-case';
import { RemoveDevicesAfterLogoutUseCase } from './application/use-cases/remove-devices-after-logout.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from './infrastructure/security-devices-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { DecodeTokenService } from '../../config/jwt/decode.service/decode-token-service';
import { RemoveDevicesByDeviceIdUseCase } from './application/use-cases/remove-devices-by-deviceId.use-case';
import { RemoveDevicesExceptCurrentUseCase } from './application/use-cases/remove-devices-except-current.use-case';
import { KeyResolver } from '../../common/helpers/key-resolver';

const securityDevicesCases = [
  CreateDeviceUseCase,
  RemoveDevicesAfterLogoutUseCase,
  RemoveDevicesBannedUserUseCase,
  RemoveDevicesByDeviceIdUseCase,
  RemoveDevicesExceptCurrentUseCase,
];

@Module({
  imports: [CqrsModule],
  controllers: [SecurityDevicesController],
  providers: [
    JwtService,
    UsersRawSqlRepository,
    JwtConfig,
    CaslAbilityFactory,
    UsersService,
    KeyResolver,
    DecodeTokenService,
    SecurityDevicesService,
    SecurityDevicesRawSqlRepository,
    BlacklistJwtRawSqlRepository,
    ...securityDevicesCases,
  ],
})
export class SecurityDevicesModule {}
