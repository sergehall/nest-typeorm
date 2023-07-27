import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: responseBody.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      errorResponse.message = responseBody;
    } else if (
      status === HttpStatus.BAD_REQUEST ||
      status === HttpStatus.UNAUTHORIZED
    ) {
      response.status(status).json({
        errorsMessages: responseBody.message,
      });
      return;
    }

    response.status(status).json(errorResponse);
  }
}
