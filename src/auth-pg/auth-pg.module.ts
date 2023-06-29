import { Module } from '@nestjs/common';
import { AuthPgController } from './api/auth-pg.controller';
import { AuthPgService } from './auth-pg.service';
import { CommandBus } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntityPg } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntityPg])],
  controllers: [AuthPgController],
  providers: [AuthPgService, CommandBus],
})
export class AuthPgModule {}
