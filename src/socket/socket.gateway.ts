import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesEntity } from '../features/messages/entities/messages.entity';
import { ServerToClientEvent } from './types/socket.events.type';
import { SocketEvents } from './enums/socket.events.enum';
import { ValidSocketHandshake } from './validation/valid-socket-handshake';

@WebSocketGateway({
  namespace: 'events',
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  constructor(private readonly validSocketHandshake: ValidSocketHandshake) {}
  @WebSocketServer()
  server: Server<any, ServerToClientEvent>;

  async handleConnection(client: Socket) {
    try {
      await this.validSocketHandshake.validate(client);
    } catch (err) {
      console.log('Error handleConnection:', err);
      client.disconnect(true);
    }
  }

  async sentToAll(message: MessagesEntity): Promise<void> {
    this.server.emit(SocketEvents.newMessage, message);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any): Promise<string> {
    return 'Hello from server!';
  }

  // @SubscribeMessage('events')
  // async findAll(
  //   @MessageBody() data: any,
  // ): Promise<Observable<WsResponse<number>>> {
  //   return from([1, 2, 3]).pipe(
  //     map((item) => ({ event: 'events', data: item })),
  //   );
  // }

  // @SubscribeMessage('identity')
  // async identity(@MessageBody() data: number): Promise<number> {
  //   return data;
  // }
}
