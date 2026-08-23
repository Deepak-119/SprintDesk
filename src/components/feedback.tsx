import {
  type ReactNode,
  useEffect,
} from 'react';

import { useUIStore } from '../store/uiStore';
import { Button, Card } from './ui';

export const Modal = ({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <Card className="w-full max-w-lg p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">
            {title}
          </h2>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        {children}
      </Card>
    </div>
  );
};

export const Toast = () => {
  const toast = useUIStore(
    (state) => state.toast,
  );

  const clearToast = useUIStore(
    (state) => state.clearToast,
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(
      clearToast,
      3500,
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [toast, clearToast]);

  if (!toast) {
    return null;
  }

  const indicatorClass =
    toast.type === 'error'
      ? 'bg-red-500'
      : toast.type === 'info'
        ? 'bg-blue-500'
        : 'bg-emerald-500';

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
    }

    clearToast();
  };

  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${indicatorClass}`}
        />

        <div className="flex-1 text-sm font-semibold">
          {toast.message}
        </div>

        {toast.action && (
          <Button
            type="button"
            variant="soft"
            className="shrink-0 px-3 py-1.5"
            onClick={handleAction}
          >
            {toast.action.label}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          className="shrink-0 px-2"
          aria-label="Close notification"
          onClick={clearToast}
        >
          ×
        </Button>
      </div>
    </div>
  );
};

export const DataTable = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 dark:bg-slate-900">
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50"
          >
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className="px-4 py-3"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);