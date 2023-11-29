import {
  HttpException,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  // Middleware entry point
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip ? req.ip : '';

    // Log request details when response finishes
    res.on('finish', () => {
      this.logRequest(ip, method, originalUrl, userAgent, req, res);
    });

    // Handle errors and log details
    res.on('error', (error) => {
      this.handleError(ip, method, originalUrl, userAgent, error);
    });

    // Move to the next middleware or route handler
    next();
  }

  // Log request details when response finishes
  private logRequest(
    ip: string,
    method: string,
    url: string,
    userAgent: string,
    req: Request,
    res: Response,
  ) {
    const { statusCode, statusMessage } = res;
    const contentLength = res.getHeader('content-length');
    const logMessage = `${method} ${url} ${statusCode} ${statusMessage} ${contentLength} - ${userAgent} ${ip}`;
    // this.logger.log(logMessage);
  }

  // Handle errors and log HTTP exceptions
  private handleError(
    ip: string,
    method: string,
    url: string,
    userAgent: string,
    error: any,
  ) {
    if (error instanceof HttpException) {
      const statusCode = error.getStatus(); // Get status code from HttpException
      const message = error.message || 'Internal server error'; // Get error message
      const logMessage = `${method} ${url} ${statusCode} - ${message} - ${userAgent} ${ip}`;
      this.logger.error(logMessage);
    }
  }
}
