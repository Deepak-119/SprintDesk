import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  fetchNotifications,
  normalizeApiError,
} from '../api/client';

import {
  useNotificationStore,
} from '../store/notificationStore';

import {
  useUIStore,
} from '../store/uiStore';

export const useNotifications = () => {
  const addNotifications =
    useNotificationStore(
      (state) =>
        state.addNotifications,
    );

  const showToast =
    useUIStore(
      (state) =>
        state.showToast,
    );

  const query = useQuery({
    queryKey: ['notifications-poll'],

    queryFn:
      fetchNotifications,

    /*
     * Check for new notifications
     * every 30 seconds.
     */
    refetchInterval: 30_000,

    /*
     * Don't keep polling when the
     * browser tab is hidden.
     */
    refetchIntervalInBackground:
      false,

    /*
     * Only fetch while the tab
     * is currently visible.
     */
    enabled:
      document.visibilityState ===
      'visible',
  });

  /*
   * ---------------------------------------
   * Handle API errors
   * ---------------------------------------
   *
   * React Query stores the error in
   * query.error. We convert it into our
   * standard ApiError and show a toast.
   */

  useEffect(() => {
    if (!query.error) {
      return;
    }

    const error =
      normalizeApiError(
        query.error,
        'Unable to load notifications.',
      );

    showToast(
      error.message,
      'error',
    );
  }, [
    query.error,
    showToast,
  ]);

  /*
   * ---------------------------------------
   * Store new notifications
   * ---------------------------------------
   */

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const existing =
      useNotificationStore
        .getState()
        .notifications;

    /*
     * Only treat genuinely new IDs
     * as new activity.
     */
    const fresh =
      query.data.filter(
        (notification) =>
          !existing.some(
            (item) =>
              item.id ===
              notification.id,
          ),
      );

    if (fresh.length === 0) {
      return;
    }

    /*
     * Convert API response into
     * our application notification model.
     */
    const items =
      fresh.map(
        (notification) => ({
          id: notification.id,

          title:
            notification.title ??
            'New activity',

          message:
            notification.title ??
            'Something new happened.',

          type: 'info',

          read: false,

          createdAt:
            new Date().toISOString(),
        }),
      );

    addNotifications(items);

    /*
     * Show a toast when new
     * notifications arrive while
     * the user is actively viewing
     * the application.
     */
    if (
      document.visibilityState ===
      'visible'
    ) {
      showToast(
        `${fresh.length} new notification${
          fresh.length > 1
            ? 's'
            : ''
        }`,
        'info',
      );
    }
  }, [
    query.data,
    addNotifications,
    showToast,
  ]);

  /*
   * ---------------------------------------
   * Refresh when tab becomes visible
   * ---------------------------------------
   */

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          query.refetch();
        }
      };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );
    };
  }, [query.refetch]);

  return query;
};