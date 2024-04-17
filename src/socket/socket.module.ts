import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ValidSocketJwt } from './validation/valid-socket-jwt';

@Module({
  imports: [TypeOrmModule.forFeature([]), CqrsModule],
  providers: [ValidSocketJwt, SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
