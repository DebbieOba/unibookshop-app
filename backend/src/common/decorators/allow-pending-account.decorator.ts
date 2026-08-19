import { SetMetadata } from '@nestjs/common';

export const ALLOW_PENDING_ACCOUNT_KEY = 'allowPendingAccount';

/**
 * Exempts an authenticated route from AccountStateGuard's approved-only
 * check — for the small set of endpoints a PENDING/REJECTED user legitimately
 * needs (checking their own status, logging out). Every other endpoint stays
 * blocked by default; see backend-architecture.md §10.2.
 */
export const AllowPendingAccount = () => SetMetadata(ALLOW_PENDING_ACCOUNT_KEY, true);
