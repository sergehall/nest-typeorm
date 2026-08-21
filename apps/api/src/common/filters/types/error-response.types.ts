export type ErrorResponseType = {
  statusCode: number;
  message: string | readonly string[];
  timestamp: string;
  path: string;
};
