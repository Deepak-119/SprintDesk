import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  action?: ToastAction;
}

interface UIState {
  theme: 'light' | 'dark';

  setTheme: (
    theme: 'light' | 'dark',
  ) => void;

  drawerTaskId: number | null;

  setDrawerTaskId: (
    id: number | null,
  ) => void;

  toast: ToastState | null;

  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info',
    action?: ToastAction,
  ) => void;

  clearToast: () => void;
}

export const useUIStore =
  create<UIState>()(
    persist(
      (set) => ({
        theme: 'light',

        setTheme: (theme) => {
          document.documentElement.classList.toggle(
            'dark',
            theme === 'dark',
          );

          set({ theme });
        },

        drawerTaskId: null,

        setDrawerTaskId: (drawerTaskId) => {
          set({ drawerTaskId });
        },

        toast: null,

        showToast: (
          message,
          type = 'success',
          action,
        ) => {
          set({
            toast: {
              message,
              type,
              action,
            },
          });
        },

        clearToast: () => {
          set({ toast: null });
        },
      }),

      {
        name: 'sprintdesk-ui',

        // Only persist the theme.
        // Toasts and drawer state are temporary UI state.
        partialize: (state) => ({
          theme: state.theme,
        }),

        onRehydrateStorage: () =>
          (state) => {
            if (state) {
              document.documentElement.classList.toggle(
                'dark',
                state.theme === 'dark',
              );
            }
          },
      },
    ),
  );