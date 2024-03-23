import { IsNotEmpty, Matches } from 'class-validator';

// Define the UUID regex pattern UUID.UUID
export const uuidRegexPattern: RegExp =
  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\.([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

export class ReferenceIdType {
  @IsNotEmpty()
  @Matches(uuidRegexPattern)
  referenceId: string; // clientId + '.' + orderId;
}
