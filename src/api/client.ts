import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import type {
  AuthResponse,
  MockData,
} from '../types';

/*
 * ---------------------------------------
 * API configuration
 * ---------------------------------------
 */

const API_URL =
  'https://dummyjson.com';

let accessToken:
  string | null = null;

let refreshPromise:
  Promise<string> | null = null;

/*
 * ---------------------------------------
 * Custom API error
 * ---------------------------------------
 */

export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(
    message: string,
    status?: number,
    code?: string,
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/*
 * ---------------------------------------
 * Token helpers
 * ---------------------------------------
 */

export const setAccessToken = (
  token: string | null,
) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

/*
 * ---------------------------------------
 * Axios instance
 * ---------------------------------------
 */

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
});

/*
 * ---------------------------------------
 * Request interceptor
 * ---------------------------------------
 *
 * Automatically attach the access token
 * to protected API requests.
 */

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig,
  ) => {
    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
);

/*
 * ---------------------------------------
 * Refresh access token
 * ---------------------------------------
 */

const refreshAccessToken =
  async (): Promise<string> => {
    const refreshToken =
      localStorage.getItem(
        'sprintdesk_refresh_token',
      );

    if (!refreshToken) {
      throw new ApiError(
        'No refresh token available.',
      );
    }

    try {
      const response =
        await axios.post<AuthResponse>(
          `${API_URL}/auth/refresh`,
          {
            refreshToken,
            expiresInMins: 30,
          },
          {
            timeout: 10_000,
          },
        );

      const newAccessToken =
        response.data.accessToken;

      const newRefreshToken =
        response.data.refreshToken;

      if (!newAccessToken) {
        throw new ApiError(
          'Refresh did not return an access token.',
        );
      }

      accessToken =
        newAccessToken;

      if (newRefreshToken) {
        localStorage.setItem(
          'sprintdesk_refresh_token',
          newRefreshToken,
        );
      }

      return newAccessToken;
    } catch (error) {
      throw normalizeApiError(
        error,
        'Unable to refresh your session.',
      );
    }
  };

/*
 * ---------------------------------------
 * Restore session
 * ---------------------------------------
 */

export const restoreAccessToken =
  async () => {
    if (accessToken) {
      return accessToken;
    }

    const refreshToken =
      localStorage.getItem(
        'sprintdesk_refresh_token',
      );

    if (!refreshToken) {
      return null;
    }

    return refreshAccessToken();
  };

/*
 * ---------------------------------------
 * Response interceptor
 * ---------------------------------------
 *
 * If an authenticated request returns 401:
 *
 * 1. Refresh the access token.
 * 2. Retry the original request.
 *
 * Multiple failed requests share the same
 * refresh request.
 */

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const config =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean;
          })
        | undefined;

    /*
     * Only handle unauthorized requests.
     */
    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      config.url?.includes('/auth/')
    ) {
      throw normalizeApiError(
        error,
      );
    }

    config._retry = true;

    /*
     * Prevent multiple simultaneous
     * refresh requests.
     */
    refreshPromise ??=
      refreshAccessToken().finally(
        () => {
          refreshPromise = null;
        },
      );

    try {
      const token =
        await refreshPromise;

      config.headers.Authorization =
        `Bearer ${token}`;

      return api(config);
    } catch (refreshError) {
      throw normalizeApiError(
        refreshError,
        'Your session has expired. Please sign in again.',
      );
    }
  },
);

/*
 * ---------------------------------------
 * Error normalization
 * ---------------------------------------
 *
 * Converts different kinds of errors
 * into one predictable ApiError.
 */

export const normalizeApiError = (
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again.',
): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status =
      error.response?.status;

    const serverMessage =
      (
        error.response?.data as
          | {
              message?: string;
            }
          | undefined
      )?.message;

    /*
     * Network error
     */
    if (!error.response) {
      return new ApiError(
        'Network error. Please check your internet connection.',
        undefined,
        error.code,
      );
    }

    /*
     * Common HTTP errors
     */
    if (status === 400) {
      return new ApiError(
        serverMessage ??
          'Invalid request. Please check your input.',
        status,
      );
    }

    if (status === 401) {
      return new ApiError(
        serverMessage ??
          'Your session is no longer valid. Please sign in again.',
        status,
      );
    }

    if (status === 403) {
      return new ApiError(
        serverMessage ??
          'You do not have permission to perform this action.',
        status,
      );
    }

    if (status === 404) {
      return new ApiError(
        serverMessage ??
          'The requested resource was not found.',
        status,
      );
    }

    if (status !== undefined && status >= 500) {
      return new ApiError(
        'The server is currently unavailable. Please try again later.',
        status,
      );
    }

    return new ApiError(
      serverMessage ??
        fallbackMessage,
      status,
      error.code,
    );
  }

  if (error instanceof Error) {
    return new ApiError(
      error.message,
    );
  }

  return new ApiError(
    fallbackMessage,
  );
};

/*
 * ---------------------------------------
 * Login
 * ---------------------------------------
 */

export const loginRequest = async (
  username: string,
  password: string,
) => {
  try {
    const response =
      await api.post<AuthResponse>(
        '/auth/login',
        {
          username,
          password,
          expiresInMins: 30,
        },
      );

    return response.data;
  } catch (error) {
    throw normalizeApiError(
      error,
      'Unable to sign in. Please check your credentials.',
    );
  }
};

/*
 * ---------------------------------------
 * Mock application data
 * ---------------------------------------
 */

export const fetchMockData =
  async (): Promise<MockData> => {
    try {
      const response =
        await fetch(
          '/mock-data.json',
        );

      if (!response.ok) {
        throw new ApiError(
          'Unable to load application data.',
          response.status,
        );
      }

      return (await response.json()) as MockData;
    } catch (error) {
      throw normalizeApiError(
        error,
        'Unable to load application data.',
      );
    }
  };

/*
 * ---------------------------------------
 * Notifications
 * ---------------------------------------
 */

export const fetchNotifications =
  async (): Promise<
    Array<{
      id: number;
      title: string;
      body: string;
    }>
  > => {
    try {
      const response =
        await fetch(
          'https://jsonplaceholder.typicode.com/posts?_limit=5',
        );

      if (!response.ok) {
        throw new ApiError(
          'Unable to load notifications.',
          response.status,
        );
      }

      return (await response.json()) as Array<{
        id: number;
        title: string;
        body: string;
      }>;
    } catch (error) {
      throw normalizeApiError(
        error,
        'Unable to load notifications.',
      );
    }
  };