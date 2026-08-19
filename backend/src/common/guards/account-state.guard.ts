import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_PENDING_ACCOUNT_KEY } from '../decorators/allow-pending-account.decorator';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

/**
 * Rejects any authenticated request from a PENDING/REJECTED account against
 * non-auth endpoints — see backend-architecture.md §10.2.
 */
@Injectable()
export class AccountStateGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const allowPending = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_ACCOUNT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowPending) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUserPayload | undefined = request.user;

    if (user && user.accountState !== 'APPROVED') {
      throw new ForbiddenException('Account is not approved');
    }
    return true;
  }
}
