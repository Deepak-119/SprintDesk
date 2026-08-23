import {
  useState,
} from 'react';

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useUIStore } from '../store/uiStore';

import { useNotifications } from '../hooks/useNotifications';

import { NotificationPanel } from '../features/notifications/NotificationPanel';

const navItems = [
  ['/dashboard', 'Overview'],
  ['/board', 'Sprint Board'],
  ['/analytics', 'Analytics'],
] as const;

export const Layout = () => {
  const navigate = useNavigate();

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const user = useAuthStore(
    (state) => state.user,
  );

  const theme = useUIStore(
    (state) => state.theme,
  );

  const setTheme = useUIStore(
    (state) => state.setTheme,
  );

  const unread = useNotificationStore(
    (state) =>
      state.notifications.filter(
        (notification) => !notification.read,
      ).length,
  );

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(
      theme === 'light'
        ? 'dark'
        : 'light',
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-7">
          {/* Brand & Navigation */}
          <div className="flex items-center gap-7">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-black text-white dark:bg-white dark:text-slate-900">
                S
              </div>

              <span className="text-lg font-black tracking-tight">
                SprintDesk
              </span>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map(
                ([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({
                      isActive,
                    }) =>
                      `rounded-xl px-3.5 py-2 text-sm font-semibold ${
                        isActive
                          ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                          : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ),
              )}
            </nav>
          </div>

          {/* User Actions */}
          <div className="relative flex items-center gap-2">
            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() =>
                setNotificationOpen(
                  (value) => !value,
                )
              }
              className="relative grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              ⌁

              {unread > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {theme === 'light'
                ? '☾'
                : '☀'}
            </button>

            {/* Divider */}
            <div className="hidden h-9 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

            {/* User Info */}
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold">
                {user?.firstName}{' '}
                {user?.lastName}
              </p>

              <p className="text-[11px] text-slate-400">
                Product Engineer
              </p>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl px-2 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {notificationOpen && (
        <NotificationPanel
          onClose={() =>
            setNotificationOpen(false)
          }
        />
      )}

      {/* Page Content */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-7 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};