import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { inspect } from 'util';

/** Some SDKs (e.g. Cloudinary) reject with a plain object, not an `Error` —
 * `String(plainObject)` collapses to the useless "[object Object]", which is
 * exactly what made a real upload failure invisible in the logs. `inspect`
 * actually shows the object's fields. */
function describeException(exception: unknown): string {
  if (exception instanceof Error) {
    const base = exception.stack ?? exception.message;
    // `cause` (e.g. UploadService wrapping a raw Cloudinary error object)
    // carries the actually-useful detail — surface it too, not just the
    // wrapper's message.
    return exception.cause !== undefined ? `${base}\nCaused by: ${inspect(exception.cause, { depth: 5 })}` : base;
  }
  return inspect(exception, { depth: 5 });
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = isHttpException ? exception.getResponse() : null;
    const message =
      body && typeof body === 'object' && 'message' in body
        ? (body as { message: string | string[] }).message
        : isHttpException
          ? exception.message
          : 'Internal server error';

    // Anything that isn't a deliberate HttpException (validation, 404, 403,
    // etc.) is unexpected — log it server-side with a stack trace, since the
    // client only ever sees the generic "Internal server error" message
    // above. Without this, a bug here is invisible outside a debugger.
    if (!isHttpException || statusCode >= 500) {
      this.logger.error(`${request.method} ${request.url} -> ${statusCode}`, describeException(exception));
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: isHttpException ? exception.name : 'InternalServerError',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
