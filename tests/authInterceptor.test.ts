import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
} from 'axios';

import {
  api,
  getAccessToken,
  setAccessToken,
} from '../src/api/client';

describe('API authentication interceptor', () => {
  let originalAdapter: typeof api.defaults.adapter;

  beforeEach(() => {
    originalAdapter = api.defaults.adapter;

    localStorage.clear();
    setAccessToken(null);
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;

    localStorage.clear();
    setAccessToken(null);

    vi.restoreAllMocks();
  });

  it('refreshes the token after 401 and retries the original request', async () => {
    localStorage.setItem(
      'sprintdesk_refresh_token',
      'old-refresh-token',
    );

    setAccessToken('expired-access-token');

    const refreshRequest = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      } as never);

    let requestCount = 0;

    api.defaults.adapter = async (config) => {
      requestCount += 1;

      /*
       * First request:
       * simulate an expired access token.
       */
      if (requestCount === 1) {
        const response = {
          data: {
            message: 'Unauthorized',
          },
          status: 401,
          statusText: 'Unauthorized',
          headers: new AxiosHeaders(),
          config,
        };

        throw new AxiosError(
          'Request failed with status code 401',
          'ERR_BAD_REQUEST',
          config,
          undefined,
          response,
        );
      }

      /*
       * Second request:
       * this is the automatic retry after
       * the token refresh.
       */
      return {
        data: {
          success: true,
        },
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config,
      };
    };

    const response =
      await api.get('/protected-resource');

    expect(response.status).toBe(200);

    expect(response.data).toEqual({
      success: true,
    });

    /*
     * Original request + retry.
     */
    expect(requestCount).toBe(2);

    /*
     * Refresh endpoint should have been called.
     */
    expect(
      refreshRequest,
    ).toHaveBeenCalledTimes(1);

    expect(
      refreshRequest,
    ).toHaveBeenCalledWith(
      'https://dummyjson.com/auth/refresh',
      {
        refreshToken:
          'old-refresh-token',
        expiresInMins: 30,
      },
      {
        timeout: 10_000,
      },
    );

    /*
     * The new access token should now
     * be available in memory.
     */
    expect(
      getAccessToken(),
    ).toBe('new-access-token');

    /*
     * The rotated refresh token should
     * also be persisted.
     */
    expect(
      localStorage.getItem(
        'sprintdesk_refresh_token',
      ),
    ).toBe('new-refresh-token');
  });
});