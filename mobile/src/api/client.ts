import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';
import { secureStorage } from '../lib/secureStorage';
import { getErrorMessage, isRetryableError } from '../lib/apiError';

// SET TO true: Connects your local Expo Go app directly to the live production Render server.
// SET TO false: Connects to your local machine's backend server (requires running local backend on port 3000).
// (Useful if your Wi-Fi router/mobile hotspot has client isolation or firewall blocking local communication).
const USE_PRODUCTION_BACKEND_IN_DEV = true;

const getBaseURL = () => {
  // Use the production Render server if not in development or if explicitly toggled on
  if (!__DEV__ || USE_PRODUCTION_BACKEND_IN_DEV) {
    return 'https://curricula-backend-hepr.onrender.com/api/v1';
  }

  // Try multiple ways to resolve the local Metro packager IP address in development
  let host = Constants.expoConfig?.hostUri;

  if (!host) {
    const projectUrl = Constants.manifest2?.extra?.expoGo?.developer?.projectUrl;
    if (projectUrl) {
      host = projectUrl.replace('exp://', '');
    }
  }

  if (!host && Constants.linkingUri) {
    const match = Constants.linkingUri.match(/exp:\/\/([^:/]+)/);
    if (match) {
      host = match[1];
    }
  }

  if (!host) {
    host = (Constants as any).manifest?.debuggerHost;
  }

  if (host) {
    const ip = host.split(':')[0];
    return `http://${ip}:3000/api/v1`;
  }

  // Fallback to localhost
  return 'http://localhost:3000/api/v1';
};

const baseURL = getBaseURL();

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[api] --- Dev API Diagnostic ---');
  // eslint-disable-next-line no-console
  console.log(`[api] baseURL = ${baseURL}`);
  // eslint-disable-next-line no-console
  console.log(`[api] Constants.expoConfig = ${JSON.stringify(Constants.expoConfig)}`);
  // eslint-disable-next-line no-console
  console.log(`[api] Constants.manifest2 = ${JSON.stringify(Constants.manifest2)}`);
  // eslint-disable-next-line no-console
  console.log(`[api] Constants.linkingUri = ${Constants.linkingUri}`);
  // eslint-disable-next-line no-console
  console.log('[api] ---------------------------');
}



const MAX_RETRIES = 2;
const RETRY_DELAY_MS = [500, 1500];

export const api = axios.create({ baseURL, timeout: 60000 });

// Dev-only call logging — every request/response/error shows up in the
// Metro/device logs, so "is the app actually calling the API, and what came
// back" is visible without attaching a network debugger. Never logs request
// bodies (login/register carry passwords) or the auth token, only method,
// path, status and timing.
function logRequest(config: InternalAxiosRequestConfig) {
  if (!__DEV__) return;
  (config as { _loggedAt?: number })._loggedAt = Date.now();
  // eslint-disable-next-line no-console
  console.log(`[api] → ${config.method?.toUpperCase()} ${pathOnly(config.url, config.baseURL)}`);
}

function logResponse(status: number | 'ERR', config: InternalAxiosRequestConfig | undefined, detail?: string) {
  if (!__DEV__ || !config) return;
  const startedAt = (config as { _loggedAt?: number })._loggedAt;
  const ms = startedAt ? `${Date.now() - startedAt}ms` : '?ms';
  const isError = status === 'ERR' || (typeof status === 'number' && status >= 400);
  const icon = status === 'ERR' ? '✗' : isError ? '⚠' : '✓';
  const line = `[api] ${icon} ${config.method?.toUpperCase()} ${pathOnly(config.url, config.baseURL)} ${status} (${ms})`;
  if (isError) {
    // eslint-disable-next-line no-console
    console.warn(line, detail ?? '');
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

function pathOnly(url?: string, base?: string) {
  if (!url) return '';
  return base && url.startsWith(base) ? url.slice(base.length) : url;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  logRequest(config);
  return config;
});

api.interceptors.response.use(
  (response) => {
    logResponse(response.status, response.config);
    return response;
  },
  (error) => {
    if (error instanceof AxiosError) {
      logResponse(error.response?.status ?? 'ERR', error.config, getErrorMessage(error));
    }
    throw error;
  },
);

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original) throw error; // request never even built (e.g. bad baseURL config)

    // Transient network failures / 502-504 on a safe, idempotent GET — retry
    // with a short backoff rather than immediately surfacing an error. Never
    // retries mutating requests (POST/PATCH/DELETE), since we can't tell
    // whether they already reached the server.
    if (original.method?.toLowerCase() === 'get' && isRetryableError(error)) {
      original._retryCount = (original._retryCount ?? 0) + 1;
      if (original._retryCount <= MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS[original._retryCount - 1] ?? 1500));
        return api(original);
      }
    }

    if (error.response?.status !== 401 || original._retried) {
      throw error;
    }
    original._retried = true;

    refreshing ??= refreshAccessToken();
    const outcome = await refreshing;
    refreshing = null;

    if (outcome === 'network-error') {
      // The refresh attempt itself couldn't reach the server — this is not
      // proof the session is invalid, so don't log the user out over a
      // connectivity blip. Surface the original 401 and let the next
      // request try again once connectivity returns.
      throw error;
    }
    if (!outcome) {
      useAuthStore.getState().clearSession();
      throw error;
    }

    useAuthStore.getState().setAccessToken(outcome);
    original.headers.Authorization = `Bearer ${outcome}`;
    return api(original);
  },
);

/** Returns the new access token, `null` if the refresh token is genuinely
 * invalid/expired (server said so), or `'network-error'` if the refresh
 * request never got a response at all. */
async function refreshAccessToken(): Promise<string | null | 'network-error'> {
  const refreshToken = await secureStorage.getRefreshToken();
  if (!refreshToken) return null;

  const startedAt = Date.now();
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[api] → POST /auth/refresh');
  }

  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken }, { timeout: 60000 });
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[api] ✓ POST /auth/refresh 200 (${Date.now() - startedAt}ms)`);
    }
    await secureStorage.setRefreshToken(data.refreshToken);
    return data.accessToken as string;
  } catch (err) {
    if (__DEV__) {
      const status = err instanceof AxiosError ? (err.response?.status ?? 'ERR') : 'ERR';
      // eslint-disable-next-line no-console
      console.warn(`[api] ✗ POST /auth/refresh ${status} (${Date.now() - startedAt}ms)`, getErrorMessage(err));
    }
    if (err instanceof AxiosError && !err.response) {
      return 'network-error';
    }
    return null;
  }
}
