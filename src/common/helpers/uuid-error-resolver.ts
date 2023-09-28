import { Injectable } from '@nestjs/common';

@Injectable()
export class UuidErrorResolver {
  async isInvalidUUIDError(error: any): Promise<boolean> {
    return error.message.includes('invalid input syntax for type uuid');
  }

  async extractUserIdFromError(error: any): Promise<string | null> {
    const match = error.message.match(/"([^"]+)"/);
    return match ? match[1] : null;
  }
}
