import { Module } from '@nestjs/common';
import { SecurityDevicesService } from './application/security-devices.service';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersService } from '../users/application/users.service';
import { CaslAbilityFactory } from '../../ability/casl-ability.factory';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from '../../config/jwt/jwt-config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateDeviceUseCase } from './application/use-cases/create-device.use-case';
import { UsersRawSqlRepository } from '../users/infrastructure/users-raw-sql.repository';
import { SecurityDevicesRawSqlRepository } from './infrastructure/security-devices-raw-sql.repository';
import { BlacklistJwtRawSqlRepository } from '../auth/infrastructure/blacklist-jwt-raw-sql.repository';
import { DecodeTokenService } from '../../config/jwt/decode.service/decode-token-service';
import { RemoveDevicesByDeviceIdUseCase } from './application/use-cases/remove-devices-by-deviceId.use-case';
import { RemoveDevicesExceptCurrentUseCase } from './application/use-cases/remove-devices-except-current.use-case';
import { KeyResolver } from '../../common/helpers/key-resolver';
import { SearchDevicesUseCase } from './application/use-cases/search-devices.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepo } from '../users/infrastructure/users-repo';
import { SecurityDevicesRepo } from './infrastructure/security-devices.repo';
import { UsersEntity } from '../users/entities/users.entity';
import { SecurityDevicesEntity } from './entities/session-devices.entity';
import { InvalidJwtRepo } from '../auth/infrastructure/invalid-jwt-repo';
import { InvalidJwtEntity } from '../auth/entities/invalid-jwt.entity';
import { UpdateDeviceUseCase } from './application/use-cases/update-device.use-case';
import { DeleteDevicesAfterLogoutUseCase } from './application/use-cases/delete-devices-after-logout.use-case';

const securityDevicesCases = [
  SearchDevicesUseCase,
  CreateDeviceUseCase,
  UpdateDeviceUseCase,
  DeleteDevicesAfterLogoutUseCase,
  RemoveDevicesByDeviceIdUseCase,
  RemoveDevicesExceptCurrentUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SecurityDevicesEntity,
      UsersEntity,
      InvalidJwtEntity,
    ]),
    CqrsModule,
  ],
  controllers: [SecurityDevicesController],
  providers: [
    JwtService,
    UsersRepo,
    UsersRawSqlRepository,
    JwtConfig,
    CaslAbilityFactory,
    UsersService,
    KeyResolver,
    DecodeTokenService,
    SecurityDevicesService,
    SecurityDevicesRepo,
    SecurityDevicesRawSqlRepository,
    InvalidJwtRepo,
    BlacklistJwtRawSqlRepository,
    ...securityDevicesCases,
  ],
})
export class SecurityDevicesModule {}
