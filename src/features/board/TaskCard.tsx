import {
  useDraggable,
} from '@dnd-kit/core';

import {
  CSS,
} from '@dnd-kit/utilities';

import type {
  Task,
  User,
} from '../../types';

import {
  Badge,
} from '../../components/ui';

interface TaskCardProps {
  task: Task;
  user?: User;
  onOpen: () => void;
}

export const TaskCard = ({
  task,
  user,
  onOpen,
}: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const isOverdue =
    task.dueDate <
      new Date()
        .toISOString()
        .slice(0, 10) &&
    task.status !== 'done';

  const dueDateLabel =
    new Date(
      task.dueDate,
    ).toLocaleDateString(
      undefined,
      {
        month: 'short',
        day: 'numeric',
      },
    );

  const priorityTone =
    task.priority === 'high'
      ? 'red'
      : task.priority === 'medium'
        ? 'amber'
        : 'slate';

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:
          CSS.Translate.toString(
            transform,
          ),
      }}
      {...attributes}
      {...listeners}
      onDoubleClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`w-full cursor-grab rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 ${
        isDragging
          ? 'opacity-40'
          : ''
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge tone={priorityTone}>
          {task.priority}
        </Badge>

        <span className="text-[10px] font-bold text-slate-400">
          #{task.id}
        </span>
      </div>

      {/* Task Content */}
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left"
      >
        <p className="text-sm font-bold leading-5">
          {task.title}
        </p>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
          {task.description}
        </p>
      </button>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          <img
            className="h-6 w-6 rounded-full"
            src={user?.avatar}
            alt={
              user
                ? `${user.name} avatar`
                : ''
            }
          />

          <span className="max-w-20 truncate text-[10px] font-semibold text-slate-500">
            {user?.name}
          </span>
        </div>

        {/* Due Date */}
        <span
          className={`text-[10px] font-bold ${
            isOverdue
              ? 'text-red-500'
              : 'text-slate-400'
          }`}
        >
          {dueDateLabel}
        </span>
      </div>
    </div>
  );
};