import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseType } from './types/error-response.types';

type HttpErrorBody = {
  readonly message?: string | readonly string[];
};

@Catch()
export class HttpExceptionResponseFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionResponseFilter.name);
  /**
   * Catch method that handles instances of HttpException and formats the response as per the ErrorResponseType.
   * @param {HttpException} exception - The HttpException instance that was thrown.
   * @param {ArgumentsHost} host - The context of the request.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const rawResponse = isHttpException ? exception.getResponse() : undefined;
    const responseBody: HttpErrorBody =
      typeof rawResponse === 'object' && rawResponse !== null
        ? (rawResponse as HttpErrorBody)
        : { message: typeof rawResponse === 'string' ? rawResponse : undefined };
    const safeMessage =
      status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error.'
        : (responseBody.message ?? 'Request failed.');

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error = exception instanceof Error ? exception : new Error('Unknown HTTP failure');
      this.logger.error(`${request.method} ${request.path} failed`, error.stack);
    }

    // Build the error response object
    const errorResponse: ErrorResponseType = {
      statusCode: status,
      message: safeMessage,
      timestamp: new Date().toISOString(),
      path: request.path,
    };

    // Special handling for rate-limiting error messages, if needed
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      errorResponse.message = safeMessage;
    } else if (
      // Special handling for BAD_REQUEST OR UNAUTHORIZED error
      status === HttpStatus.BAD_REQUEST ||
      status === HttpStatus.UNAUTHORIZED
    ) {
      response.status(status).json({
        errorsMessages: safeMessage,
      });
      return;
    }
    // Send the error response
    response.status(status).json(errorResponse);
  }
}
