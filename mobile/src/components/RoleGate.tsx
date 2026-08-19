import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface RoleGateProps {
  allow: Array<'student' | 'admin'>;
  children: ReactNode;
}

/**
 * UX convenience only — hides role-gated UI within a shared screen. The real
 * security boundary is the backend guard; see frontend-architecture.md §9.
 */
export function RoleGate({ allow, children }: RoleGateProps) {
  const role = useAuthStore((s) => s.user?.role);
  if (!role || !allow.includes(role)) return null;
  return <>{children}</>;
}
