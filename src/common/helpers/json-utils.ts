import { Injectable } from '@nestjs/common';
import { BuyRequestDto } from '../../features/blogs/dto/buy-request.dto';

@Injectable()
export class JsonUtils {
  async fromJson(jsonString: string): Promise<BuyRequestDto> {
    return new Promise((resolve, reject) => {
      try {
        // Parse the JSON string
        const obj = JSON.parse(jsonString);
        resolve(obj);
      } catch (error) {
        // Reject with the parsing error
        reject(error);
      }
    });
  }
}
