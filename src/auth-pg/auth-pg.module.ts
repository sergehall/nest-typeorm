import { Module } from '@nestjs/common';
import { AuthPgController } from './auth-pg.controller';
import { AuthPgService } from './auth-pg.service';

@Module({
  controllers: [AuthPgController],
  providers: [AuthPgService],
})
export class AuthPgModule {}
