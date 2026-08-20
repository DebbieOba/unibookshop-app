import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role, AccountState } from '@prisma/client';

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: Role;
  accountState: AccountState;
  bookshopId?: string | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
