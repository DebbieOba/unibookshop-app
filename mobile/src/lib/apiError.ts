import { AxiosError } from 'axios';

/** Backend's HttpExceptionFilter error shape (backend-architecture.md §13). */
interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Extracts a user-showable message from any error thrown by the `api`
 * client — distinguishes "server responded with a real error" from "the
 * request never reached the server" so screens can show something more
 * useful than a generic toast.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  if (error.response) {
    const body = error.response.data as ApiErrorBody | undefined;
    const message = body?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.length > 0) return message;
    return fallback;
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Check your connection and try again.';
  }
  return 'Could not reach the server. Check your connection and try again.';
}

/** True for errors worth retrying (network-level or a transient 5xx) — never
 * true for a genuine 4xx, which retrying won't fix. */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;
  if (!error.response) return true; // no response at all = network/timeout
  return [502, 503, 504].includes(error.response.status);
}
