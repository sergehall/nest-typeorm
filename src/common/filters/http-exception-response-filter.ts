import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseType } from './types/error-response.types';

@Catch(HttpException)
export class HttpExceptionResponseFilter implements ExceptionFilter {
  /**
   * Catch method that handles instances of HttpException and formats the response as per the ErrorResponseType.
   * @param {HttpException} exception - The HttpException instance that was thrown.
   * @param {ArgumentsHost} host - The context of the request.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Get the response body from the HttpException
    const responseBody: any = exception.getResponse();

    // Build the error response object
    const errorResponse: ErrorResponseType = {
      statusCode: status,
      message: responseBody.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Special handling for rate-limiting error messages, if needed
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      errorResponse.message = responseBody;
    } else if (
      // Special handling for BAD_REQUEST OR UNAUTHORIZED error
      status === HttpStatus.BAD_REQUEST ||
      status === HttpStatus.UNAUTHORIZED
    ) {
      response.status(status).json({
        errorsMessages: responseBody.message,
      });
      return;
    }
    // Send the error response
    response.status(status).json(errorResponse);
  }
}
