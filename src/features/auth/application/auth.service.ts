import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PayloadDto } from '../dto/payload.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async toExtractPayload(token: string): Promise<PayloadDto> {
    const payload = this.jwtService.decode(token) as {
      [key: string]: any;
    } | null;

    if (!payload) {
      throw new InternalServerErrorException({
        message: 'Invalid refreshToken, cannot be decoded.',
      });
    }

    const { userId, deviceId, iat, exp } = payload;
    return { userId, deviceId, iat, exp };
  }
}
