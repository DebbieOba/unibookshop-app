import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  Observable,
  TimeoutError,
  catchError,
  throwError,
  timeout,
} from 'rxjs';

const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Guards against a hung request (e.g. a stalled DB/Redis connection) tying up
 * a connection indefinitely — converts it into a clean 408 instead of the
 * client waiting forever. Payment webhooks and file uploads get more room
 * since they can legitimately take longer than a typical CRUD call.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const isSlowRoute =
      request?.url?.includes('/webhook') ||
      request?.url?.includes('/cover') ||
      request?.url?.includes('/avatar');
    const limit = isSlowRoute ? REQUEST_TIMEOUT_MS * 2 : REQUEST_TIMEOUT_MS;

    return next.handle().pipe(
      timeout(limit),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                'The request took too long to process',
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
