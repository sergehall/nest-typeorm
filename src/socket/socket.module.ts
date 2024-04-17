import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ValidSocketHandshake } from './validation/valid-socket-handshake';

@Module({
  imports: [TypeOrmModule.forFeature([]), CqrsModule],
  providers: [ValidSocketHandshake, SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
