import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: 'student' | 'admin';
  accountState: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESTRICTED';
  bookshopId?: string | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
