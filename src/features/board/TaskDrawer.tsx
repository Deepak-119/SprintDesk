import { useEffect, useState } from 'react';

import {
  Button,
  Input,
  Select,
} from '../../components/ui';

import { useMockData } from '../../hooks/useMockData';

import { useAuthStore } from '../../store/authStore';

import { useBoardStore } from '../../store/boardStore';

import { useUIStore } from '../../store/uiStore';

import type { Priority } from '../../types';

export const TaskDrawer = () => {
  // ---------------------------------------
  // UI state
  // ---------------------------------------

  const taskId = useUIStore(
    (state) => state.drawerTaskId,
  );

  const closeDrawer = useUIStore(
    (state) => state.setDrawerTaskId,
  );

  const showToast = useUIStore(
    (state) => state.showToast,
  );

  // ---------------------------------------
  // Board state
  // ---------------------------------------

  const tasks = useBoardStore(
    (state) => state.tasks,
  );

  const comments = useBoardStore(
    (state) => state.comments,
  );

  const updateTask = useBoardStore(
    (state) => state.updateTask,
  );

  const deleteTask = useBoardStore(
    (state) => state.deleteTask,
  );

  const addComment = useBoardStore(
    (state) => state.addComment,
  );

  // ---------------------------------------
  // Authentication
  // ---------------------------------------

  const currentUser = useAuthStore(
    (state) => state.user,
  );

  // ---------------------------------------
  // Mock data
  // ---------------------------------------

  const { data } = useMockData();

  // ---------------------------------------
  // Current task
  // ---------------------------------------

  const task = tasks.find(
    (item) => item.id === taskId,
  );

  const [comment, setComment] =
    useState('');

  // Reset comment input whenever
  // another task is opened.
  useEffect(() => {
    setComment('');
  }, [taskId]);

  if (!task) {
    return null;
  }

  // ---------------------------------------
  // Task metadata
  // ---------------------------------------

  const assignee = data?.users.find(
    (item) =>
      item.id === task.assigneeId,
  );

  const taskComments =
    comments.filter(
      (item) =>
        item.taskId === task.id,
    );

  // ---------------------------------------
  // Add comment
  // ---------------------------------------

  const handleAddComment = () => {
    const message =
      comment.trim();

    if (
      !message ||
      !currentUser
    ) {
      return;
    }

    addComment({
      id: Date.now(),
      taskId: task.id,
      authorId: currentUser.id,
      message,
      createdAt:
        new Date().toISOString(),
    });

    setComment('');

    showToast(
      'Comment added successfully.',
      'success',
    );
  };

  // ---------------------------------------
  // Delete task
  // ---------------------------------------

  const handleDelete = () => {
    const confirmed =
      window.confirm(
        'Delete this task?',
      );

    if (!confirmed) {
      return;
    }

    deleteTask(task.id);

    closeDrawer(null);

    showToast(
      'Task deleted successfully.',
      'success',
    );
  };

  // ---------------------------------------
  // Render
  // ---------------------------------------

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}

      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={() =>
          closeDrawer(null)
        }
      />

      {/* Drawer */}

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-drawer-title"
        className="absolute right-0 top-0 h-full w-[min(520px,100%)] overflow-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        {/* ---------------------------------------
            Header
        --------------------------------------- */}

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Task #{task.id}
            </p>

            <h2
              id="task-drawer-title"
              className="mt-1 text-2xl font-black"
            >
              Task details
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close task details"
            onClick={() =>
              closeDrawer(null)
            }
            className="grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            ×
          </button>
        </div>

        <div className="mt-8 space-y-5">
          {/* ---------------------------------------
              Title
          --------------------------------------- */}

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              Title
            </span>

            <Input
              value={task.title}
              onChange={(event) =>
                updateTask(
                  task.id,
                  {
                    title:
                      event.target
                        .value,
                  },
                )
              }
            />
          </label>

          {/* ---------------------------------------
              Description
          --------------------------------------- */}

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              Description
            </span>

            <textarea
              value={
                task.description
              }
              onChange={(event) =>
                updateTask(
                  task.id,
                  {
                    description:
                      event.target
                        .value,
                  },
                )
              }
              className="min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          {/* ---------------------------------------
              Priority + Due date
          --------------------------------------- */}

          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm font-bold">
                Priority
              </span>

              <Select
                value={
                  task.priority
                }
                onChange={(event) =>
                  updateTask(
                    task.id,
                    {
                      priority:
                        event.target
                          .value as Priority,
                    },
                  )
                }
                className="w-full"
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </Select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold">
                Due date
              </span>

              <Input
                type="date"
                value={
                  task.dueDate
                }
                onChange={(event) =>
                  updateTask(
                    task.id,
                    {
                      dueDate:
                        event.target
                          .value,
                    },
                  )
                }
              />
            </label>
          </div>

          {/* ---------------------------------------
              Assignee
          --------------------------------------- */}

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-400">
              ASSIGNEE
            </p>

            <div className="mt-2 flex items-center gap-3">
              {assignee?.avatar ? (
                <img
                  src={
                    assignee.avatar
                  }
                  alt={`${assignee.name} avatar`}
                  className="h-9 w-9 rounded-full"
                />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {assignee?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div>
                <p className="text-sm font-bold">
                  {assignee?.name ??
                    'Unassigned'}
                </p>

                <p className="text-xs text-slate-400">
                  {assignee?.email ??
                    'No email available'}
                </p>
              </div>
            </div>
          </div>

          {/* ---------------------------------------
              Comments
          --------------------------------------- */}

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-black">
                Comments
              </h3>

              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {taskComments.length}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {/* Existing comments */}

              {taskComments.map(
                (item) => {
                  const author =
                    data?.users.find(
                      (user) =>
                        user.id ===
                        item.authorId,
                    );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {author?.avatar ? (
                            <img
                              src={
                                author.avatar
                              }
                              alt=""
                              className="h-7 w-7 rounded-full"
                            />
                          ) : (
                            <div className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                              {author?.name
                                ?.charAt(
                                  0,
                                )
                                .toUpperCase() ??
                                '?'}
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-bold">
                              {author?.name ??
                                'User'}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {new Date(
                                item.createdAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {item.message}
                      </p>
                    </div>
                  );
                },
              )}

              {/* Empty state */}

              {taskComments.length ===
                0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-500">
                    No comments yet.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Start the
                    conversation.
                  </p>
                </div>
              )}

              {/* Comment input */}

              <div className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target
                        .value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        'Enter' &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      handleAddComment();
                    }
                  }}
                  placeholder="Add a comment…"
                  aria-label="Add a comment"
                />

                <Button
                  type="button"
                  disabled={
                    !comment.trim() ||
                    !currentUser
                  }
                  onClick={
                    handleAddComment
                  }
                >
                  Add
                </Button>
              </div>

              <p className="text-[10px] text-slate-400">
                Press Enter to add a
                comment.
              </p>
            </div>
          </div>

          {/* ---------------------------------------
              Delete
          --------------------------------------- */}

          <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
            <Button
              type="button"
              variant="danger"
              onClick={
                handleDelete
              }
            >
              Delete task
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
};