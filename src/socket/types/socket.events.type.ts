import { MessagesEntity } from '../../features/messages/entities/messages.entity';

export type ServerToClientEvent = {
  newMessage: (payload: MessagesEntity) => void; // Sent from the server to all clients
};
