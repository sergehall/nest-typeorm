import { Injectable } from '@nestjs/common';
import { ExpirationDateDto } from './dto/expiration-date.dto';

// Function to calculate the expiration date
@Injectable()
export class CalculatorExpirationDate {
  async createExpDate(
    days: number,
    hours: number,
    minutes: number,
  ): Promise<ExpirationDateDto> {
    // Convert days, hours, and minutes to milliseconds
    const daysInMilliseconds: number = days * 24 * 60 * 60 * 1000;
    const hoursInMilliseconds: number = hours * 60 * 60 * 1000;
    const minutesInMilliseconds: number = minutes * 60 * 1000;

    // Calculate the total time in milliseconds
    const totalTimeInMilliseconds: number =
      daysInMilliseconds + hoursInMilliseconds + minutesInMilliseconds;

    // Calculate the future date by adding the total time
    const futureDate: Date = new Date(Date.now() + totalTimeInMilliseconds);

    // Return the future date in ISO format
    return { expirationDate: futureDate.toISOString() };
  }
}
