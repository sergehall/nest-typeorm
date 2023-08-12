import { Injectable } from '@nestjs/common';

// Function to calculate the expiration date
@Injectable()
export class ExpirationDateCalculator {
  async createExpDate(
    days: number,
    hours: number,
    minutes: number,
  ): Promise<string> {
    // Convert days, hours, and minutes to milliseconds
    const daysInMilliseconds: number = days * 24 * 60 * 60 * 1000;
    const hoursInMilliseconds: number = hours * 60 * 60 * 1000;
    const minutesInMilliseconds: number = minutes * 60 * 1000;

    // Calculate the total time in milliseconds
    const totalTimeInMilliseconds: number =
      daysInMilliseconds + hoursInMilliseconds + minutesInMilliseconds;

    // Get the current date and time
    const currentDate: Date = new Date();

    // Calculate the future date by adding the total time
    const futureDate: Date = new Date(
      currentDate.getTime() + totalTimeInMilliseconds,
    );

    // Return the future date in ISO format
    return futureDate.toISOString();
  }
}
