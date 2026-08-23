import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  useNotificationStore,
} from '../src/store/notificationStore';

describe('notification store', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
    });
  });

  it('adds unique notifications', () => {
    const notification = {
      id: 1,
      title: 'Test',
      message: 'Hello',
      type: 'task',
      read: false,
      createdAt:
        new Date().toISOString(),
    };

    useNotificationStore
      .getState()
      .addNotifications([
        notification,
        notification,
      ]);

    expect(
      useNotificationStore
        .getState()
        .notifications,
    ).toHaveLength(1);
  });

  it('marks all read', () => {
    useNotificationStore
      .getState()
      .addNotifications([
        {
          id: 1,
          title: 'A',
          message: '',
          type: 'task',
          read: false,
          createdAt: '',
        },
      ]);

    useNotificationStore
      .getState()
      .markAllRead();

    expect(
      useNotificationStore
        .getState()
        .notifications[0].read,
    ).toBe(true);
  });
});