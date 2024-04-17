import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Socket } from 'socket.io';
import { notFoundHeader } from '../../common/filters/custom-errors-messages';
import { PayloadDto } from '../../features/auth/dto/payload.dto';
import { ValidAccessJwtCommand } from '../../features/auth/application/use-cases/valid-access-jwt.use-case';

@Injectable()
export class ValidSocketHandshake {
  constructor(private readonly commandBus: CommandBus) {}

  async validate(client: Socket): Promise<void> {
    try {
      // Check if there is a context
      // const authToken = client.request?.headers?.authorization?.split(' ')[1];
      const authHeader = client.handshake.headers['authorization'];

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException(notFoundHeader.message);
      }

      // Check if the token is valid
      const result: PayloadDto | null = await this.commandBus.execute(
        new ValidAccessJwtCommand(authHeader.substring(7)),
      );

      if (!result) {
        throw new UnauthorizedException('Invalid JWT token');
      }
    } catch (err) {
      console.log(err.message);
      if (err instanceof UnauthorizedException) {
        throw new UnauthorizedException(err.message);
      } else {
        throw new InternalServerErrorException(
          'Error ValidSocketHandshake.' + err.message,
        );
      }
    }
  }
}
