import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../database/postgres/prisma.service';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

export const AUDIT_ACTION_KEY = 'auditAction';
export const AuditAction = (action: string) =>
  Reflect.metadata(AUDIT_ACTION_KEY, action);

/**
 * Writes an AuditLog row for admin-sensitive actions (approvals, book/price
 * edits, broadcasts) — see backend-architecture.md §10.5. Applied per-route
 * with @AuditAction('...'), not globally.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const action = this.reflector.get<string>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );
    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserPayload | undefined = request.user;
    const targetId = request.params?.id;

    return next.handle().pipe(
      tap(() => {
        if (!user) return;
        void this.prisma.auditLog.create({
          data: { actorId: user.id, action, targetId },
        });
      }),
    );
  }
}
