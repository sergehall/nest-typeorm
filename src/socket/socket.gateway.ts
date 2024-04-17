import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { MessagesEntity } from '../features/messages/entities/messages.entity';
import { ServerToClientEvent } from './types/socket.events.type';
import { SocketEvents } from './enums/socket.events.enum';
import { ValidSocketJwt } from './validation/valid-socket-jwt';

@WebSocketGateway({
  namespace: 'events',
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  constructor(private readonly validSocketJwt: ValidSocketJwt) {}
  @WebSocketServer()
  server: Server<any, ServerToClientEvent>;

  async handleConnection(client: Socket) {
    try {
      await this.validSocketJwt.handle(client);
    } catch (err) {
      console.error('Error validSocketJwt:', err);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any): Promise<string> {
    return 'Hello world!';
  }

  async sentToAll(message: MessagesEntity): Promise<void> {
    this.server.emit(SocketEvents.newMessage, message);
  }

  @SubscribeMessage('events')
  async findAll(
    @MessageBody() data: any,
  ): Promise<Observable<WsResponse<number>>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
