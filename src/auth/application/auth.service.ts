import { Injectable } from '@nestjs/common';
import jwt_decode from 'jwt-decode';
import { PayloadDto } from '../dto/payload.dto';

@Injectable()
export class AuthService {
  async decode(JWT: string): Promise<PayloadDto> {
    return jwt_decode(JWT);
  }
}
