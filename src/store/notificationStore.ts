import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];

  addNotifications: (
    items: Notification[],
  ) => void;

  addNotification: (
    item: Notification,
  ) => void;

  markRead: (
    id: number,
  ) => void;

  markAllRead: () => void;

  clearNotifications: () => void;
}

export const useNotificationStore =
  create<NotificationState>()(
    persist(
      (set) => ({
        notifications: [],

        /*
         * ---------------------------------------
         * Add multiple notifications
         * ---------------------------------------
         *
         * Prevents duplicate IDs both:
         *
         * 1. Against notifications already
         *    stored.
         *
         * 2. Against duplicates appearing
         *    inside the same incoming array.
         */
        addNotifications: (items) =>
          set((state) => {
            const existingIds = new Set(
              state.notifications.map(
                (notification) =>
                  notification.id,
              ),
            );

            const freshNotifications: Notification[] =
              [];

            for (const notification of items) {
              if (
                existingIds.has(
                  notification.id,
                )
              ) {
                continue;
              }

              /*
               * Add the ID immediately so
               * duplicates later in the same
               * array are also ignored.
               */
              existingIds.add(
                notification.id,
              );

              freshNotifications.push(
                notification,
              );
            }

            if (
              freshNotifications.length ===
              0
            ) {
              return state;
            }

            return {
              notifications: [
                ...freshNotifications,
                ...state.notifications,
              ].slice(0, 100),
            };
          }),

        /*
         * ---------------------------------------
         * Add one notification
         * ---------------------------------------
         */
        addNotification: (item) =>
          set((state) => {
            const alreadyExists =
              state.notifications.some(
                (notification) =>
                  notification.id ===
                  item.id,
              );

            if (alreadyExists) {
              return state;
            }

            return {
              notifications: [
                item,
                ...state.notifications,
              ].slice(0, 100),
            };
          }),

        /*
         * ---------------------------------------
         * Mark one notification as read
         * ---------------------------------------
         */
        markRead: (id) =>
          set((state) => ({
            notifications:
              state.notifications.map(
                (notification) =>
                  notification.id === id
                    ? {
                        ...notification,
                        read: true,
                      }
                    : notification,
              ),
          })),

        /*
         * ---------------------------------------
         * Mark all notifications as read
         * ---------------------------------------
         */
        markAllRead: () =>
          set((state) => ({
            notifications:
              state.notifications.map(
                (notification) => ({
                  ...notification,
                  read: true,
                }),
              ),
          })),

        /*
         * ---------------------------------------
         * Clear notification history
         * ---------------------------------------
         */
        clearNotifications: () =>
          set({
            notifications: [],
          }),
      }),

      {
        name: 'sprintdesk-notifications',
      },
    ),
  );