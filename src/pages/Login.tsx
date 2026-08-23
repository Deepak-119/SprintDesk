import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginRequest } from '../api/client';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../store/authStore';

export const Login = () => {
  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const setSession = useAuthStore(
    (state) => state.setSession,
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setBusy(true);
    setError('');

    try {
      const data = await loginRequest(
        username,
        password,
      );

      setSession(
        {
          id: data.id,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          image: data.image,
        },
        data.accessToken,
        data.refreshToken,
      );

      navigate('/dashboard');
    } catch {
      setError(
        'Unable to sign in. Check your credentials and try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_.9fr]">
      {/* Left branding section */}
      <div className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white font-black text-slate-950">
              S
            </div>

            <span className="font-black">
              SprintDesk
            </span>
          </div>

          <div className="mt-28 max-w-xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-indigo-300">
              Sprint management, refined.
            </p>

            <h1 className="text-6xl font-black leading-[1.02] tracking-tight text-white">
              Move work forward.
              <br />
              <span className="text-indigo-300">
                See the whole sprint.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
              A focused workspace for planning,
              execution, review and delivery — without
              the noise.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Deepak Kumar · Frontend Engineering Assessment · 2026
        </p>
      </div>

      {/* Login section */}
      <div className="flex items-center justify-center bg-[#f8f9fc] p-6 dark:bg-slate-900">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mb-8">
            <p className="text-sm font-bold text-indigo-600">
              Welcome back
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight">
              Sign in to SprintDesk
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Use the provided DummyJSON demo credentials.
            </p>
          </div>

          {/* Username */}
          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-bold">
              Username
            </span>

            <Input
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              autoComplete="username"
            />
          </label>

          {/* Password */}
          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-bold">
              Password
            </span>

            <Input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
            />
          </label>

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            disabled={busy}
            className="w-full py-3"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          {/* Demo credentials */}
          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900">
            <b>Demo:</b> emilys / emilyspass
          </div>
        </form>
      </div>
    </div>
  );
};