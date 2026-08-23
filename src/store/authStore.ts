import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  AuthUser,
} from '../types';

import {
  setAccessToken,
} from '../api/client';

/* ---------------------------------------
 * Auth State
 * ------------------------------------- */

interface AuthState {
  user: AuthUser | null;
  loading: boolean;

  setSession: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => void;

  logout: () => void;

  setLoading: (
    loading: boolean,
  ) => void;
}

/* ---------------------------------------
 * Auth Store
 * ------------------------------------- */

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({
        user: null,

        loading: true,

        /* ---------------------------------
         * Create authenticated session
         * --------------------------------- */

        setSession: (
          user,
          accessToken,
          refreshToken,
        ) => {
          setAccessToken(
            accessToken,
          );

          localStorage.setItem(
            'sprintdesk_refresh_token',
            refreshToken,
          );

          set({
            user,
            loading: false,
          });
        },

        /* ---------------------------------
         * Clear authenticated session
         * --------------------------------- */

        logout: () => {
          setAccessToken(null);

          localStorage.removeItem(
            'sprintdesk_refresh_token',
          );

          set({
            user: null,
            loading: false,
          });
        },

        /* ---------------------------------
         * Update loading state
         * --------------------------------- */

        setLoading: (
          loading,
        ) => {
          set({
            loading,
          });
        },
      }),

      {
        name: 'sprintdesk-auth',

        /*
         * Only persist the user.
         *
         * Access tokens stay in memory and
         * are never persisted to localStorage.
         */
        partialize: (state) => ({
          user: state.user,
        }),
      },
    ),
  );