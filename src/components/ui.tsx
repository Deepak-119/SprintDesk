import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';

/* ---------------------------------------
 * Button
 * ------------------------------------- */

type ButtonVariant =
  | 'primary'
  | 'ghost'
  | 'danger'
  | 'soft';

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

const buttonStyles: Record<
  ButtonVariant,
  string
> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900',

  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',

  danger:
    'bg-red-500 text-white hover:bg-red-600',

  soft:
    'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300',
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
  >
    {children}
  </button>
);

/* ---------------------------------------
 * Input
 * ------------------------------------- */

export const Input = ({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 ${className}`}
  />
);

/* ---------------------------------------
 * Select
 * ------------------------------------- */

export const Select = ({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 ${className}`}
  />
);

/* ---------------------------------------
 * Card
 * ------------------------------------- */

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({
  children,
  className = '',
}: CardProps) => (
  <section
    className={`rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900 ${className}`}
  >
    {children}
  </section>
);

/* ---------------------------------------
 * Badge
 * ------------------------------------- */

type BadgeTone =
  | 'slate'
  | 'red'
  | 'amber'
  | 'green'
  | 'blue'
  | 'purple';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

const badgeStyles: Record<
  BadgeTone,
  string
> = {
  slate:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',

  red:
    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',

  amber:
    'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',

  green:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',

  blue:
    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',

  purple:
    'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
};

export const Badge = ({
  children,
  tone = 'slate',
}: BadgeProps) => (
  <span
    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeStyles[tone]}`}
  >
    {children}
  </span>
);

/* ---------------------------------------
 * Skeleton
 * ------------------------------------- */

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({
  className = '',
}: SkeletonProps) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
  />
);