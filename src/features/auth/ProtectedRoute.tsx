import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { Skeleton } from '../../components/ui';

/* ---------------------------------------
 * Protected Route
 * ------------------------------------- */

export const ProtectedRoute = () => {
  const {
    user,
    loading,
  } = useAuthStore();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <Skeleton className="h-2 w-40" />
      </div>
    );
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
};

/* ---------------------------------------
 * Public Route
 * ------------------------------------- */

export const PublicRoute = () => {
  const user = useAuthStore(
    (state) => state.user,
  );

  return user ? (
    <Navigate
      to="/dashboard"
      replace
    />
  ) : (
    <Outlet />
  );
};