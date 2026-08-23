import {
  lazy,
  Suspense,
  useEffect,
} from 'react';

import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import {
  restoreAccessToken,
} from './api/client';

import {
  Layout,
} from './components/Layout';

import {
  Toast,
} from './components/feedback';

import {
  Skeleton,
} from './components/ui';

import {
  ProtectedRoute,
  PublicRoute,
} from './features/auth/ProtectedRoute';

import {
  useAuthStore,
} from './store/authStore';

/* ---------------------------------------
 * Lazy-loaded pages
 * ------------------------------------- */

const Login = lazy(() =>
  import('./pages/Login').then(
    (module) => ({
      default: module.Login,
    }),
  ),
);

const Dashboard = lazy(() =>
  import('./pages/Dashboard').then(
    (module) => ({
      default: module.Dashboard,
    }),
  ),
);

const Board = lazy(() =>
  import('./pages/Board').then(
    (module) => ({
      default: module.Board,
    }),
  ),
);

const Analytics = lazy(() =>
  import('./pages/Analytics').then(
    (module) => ({
      default: module.Analytics,
    }),
  ),
);

/* ---------------------------------------
 * Application
 * ------------------------------------- */

export const App = () => {
  const setLoading = useAuthStore(
    (state) => state.setLoading,
  );

  const user = useAuthStore(
    (state) => state.user,
  );

  /* -------------------------------------
   * Restore authentication session
   * ----------------------------------- */

  useEffect(() => {
    let isMounted = true;

    restoreAccessToken()
      .catch(() => null)
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setLoading]);

  return (
    <>
      <Toast />

      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center">
            <Skeleton className="h-2 w-40" />
          </div>
        }
      >
        <Routes>
          {/* ---------------------------------
           * Public routes
           * -------------------------------- */}

          <Route
            element={<PublicRoute />}
          >
            <Route
              path="/login"
              element={<Login />}
            />
          </Route>

          {/* ---------------------------------
           * Protected application routes
           * -------------------------------- */}

          <Route
            element={<ProtectedRoute />}
          >
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/board"
                element={<Board />}
              />

              <Route
                path="/analytics"
                element={<Analytics />}
              />
            </Route>
          </Route>

          {/* ---------------------------------
           * Fallback route
           * -------------------------------- */}

          <Route
            path="*"
            element={
              <Navigate
                to={
                  user
                    ? '/dashboard'
                    : '/login'
                }
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};