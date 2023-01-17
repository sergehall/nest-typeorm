import { Injectable, Logger, NestMiddleware, UseFilters } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpExceptionFilter } from '../exception-filter/http-exception.filter';
import { SkipThrottle } from '@nestjs/throttler';

@Injectable()
@SkipThrottle()
@UseFilters(HttpExceptionFilter)
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    req.on('finish: ', () => {
      const { statusCode } = req;
      const contentLength = req.get('content-length');
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });
    console.log('Logger', ip, method, originalUrl);
    next();
  }
}
