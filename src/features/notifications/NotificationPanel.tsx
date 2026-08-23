import { useMemo } from 'react';

import {
  Button,
  Card,
} from '../../components/ui';

import {
  useNotificationStore,
} from '../../store/notificationStore';

import type {
  Notification,
} from '../../types';

interface NotificationPanelProps {
  onClose: () => void;
}

const getNotificationTone = (
  notification: Notification,
) => {
  switch (
    notification.type.toLowerCase()
  ) {
    case 'success':
      return 'bg-emerald-500';

    case 'warning':
      return 'bg-amber-500';

    case 'error':
      return 'bg-red-500';

    default:
      return 'bg-indigo-500';
  }
};

const getRelativeTime = (
  date: string,
) => {
  const createdAt =
    new Date(date).getTime();

  const now = Date.now();

  const difference = Math.max(
    0,
    now - createdAt,
  );

  const seconds = Math.floor(
    difference / 1000,
  );

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(
    date,
  ).toLocaleDateString();
};

export const NotificationPanel = ({
  onClose,
}: NotificationPanelProps) => {
  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications,
    );

  const markRead =
    useNotificationStore(
      (state) => state.markRead,
    );

  const markAllRead =
    useNotificationStore(
      (state) =>
        state.markAllRead,
    );

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read,
      ).length,
    [notifications],
  );

  const visibleNotifications =
    notifications.slice(0, 20);

  return (
    <div className="fixed right-4 top-16 z-40 w-[min(400px,calc(100vw-2rem))]">
      <Card className="overflow-hidden shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Stay updated on your sprint
            </p>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="px-2 text-xs"
                onClick={
                  markAllRead
                }
              >
                Mark all read
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        {/* Notification list */}

        <div className="max-h-[440px] overflow-auto">
          {visibleNotifications.map(
            (notification) => (
              <button
                type="button"
                key={
                  notification.id
                }
                onClick={() =>
                  markRead(
                    notification.id,
                  )
                }
                className={`block w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 ${
                  notification.read
                    ? 'opacity-60'
                    : 'bg-indigo-50/50 dark:bg-indigo-500/5'
                }`}
              >
                <div className="flex gap-3">
                  {/* Status dot */}

                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${getNotificationTone(
                      notification,
                    )}`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold">
                        {
                          notification.title
                        }
                      </p>

                      {!notification.read && (
                        <span className="mt-1 shrink-0 text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {
                        notification.message
                      }
                    </p>

                    <p className="mt-2 text-[10px] font-medium text-slate-400">
                      {getRelativeTime(
                        notification.createdAt,
                      )}
                    </p>
                  </div>
                </div>
              </button>
            ),
          )}

          {/* Empty state */}

          {notifications.length ===
            0 && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl dark:bg-slate-800">
                ✓
              </div>

              <p className="mt-4 text-sm font-bold">
                You're all caught up
              </p>

              <p className="mt-1 text-xs text-slate-400">
                New sprint activity will
                appear here.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};