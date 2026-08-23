import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Comment,
  Priority,
  Task,
  TaskStatus,
} from '../types';

interface BoardState {
  tasks: Task[];
  comments: Comment[];

  hydrated: boolean;
  seeded: boolean;
  commentsSeeded: boolean;

  // Last drag/reorder snapshot
  previousTasks: Task[] | null;

  setTasks: (tasks: Task[]) => void;
  setComments: (comments: Comment[]) => void;

  addTask: (task: Task) => void;

  updateTask: (
    id: number,
    patch: Partial<Task>,
  ) => void;

  deleteTask: (id: number) => void;

  addComment: (
    comment: Comment,
  ) => void;

  moveTask: (
    id: number,
    status: TaskStatus,
    overId?: number,
  ) => void;

  reorder: (
    activeId: number,
    overId: number,
  ) => void;

  undoLastMove: () => void;
}

const sortTasks = (tasks: Task[]) =>
  [...tasks].sort((a, b) => {
    if (a.status === b.status) {
      return a.order - b.order;
    }

    return a.status.localeCompare(b.status);
  });

export const useBoardStore =
  create<BoardState>()(
    persist(
      (set, get) => ({
        tasks: [],
        comments: [],

        hydrated: false,
        seeded: false,
        commentsSeeded: false,

        previousTasks: null,

        // ---------------------------------------
        // Initial board data
        // ---------------------------------------

        setTasks: (tasks) =>
          set({
            tasks: sortTasks(tasks),
            seeded: true,
          }),

        setComments: (comments) =>
          set({
            comments,
            commentsSeeded: true,
          }),

        // ---------------------------------------
        // Task management
        // ---------------------------------------

        addTask: (task) =>
          set({
            tasks: sortTasks([
              ...get().tasks,
              task,
            ]),
          }),

        updateTask: (
          id,
          patch,
        ) =>
          set({
            tasks: sortTasks(
              get().tasks.map(
                (task) =>
                  task.id === id
                    ? {
                        ...task,
                        ...patch,
                        updatedAt:
                          new Date().toISOString(),
                      }
                    : task,
              ),
            ),
          }),

        deleteTask: (id) =>
          set({
            tasks: get().tasks.filter(
              (task) =>
                task.id !== id,
            ),

            comments:
              get().comments.filter(
                (comment) =>
                  comment.taskId !==
                  id,
              ),
          }),

        // ---------------------------------------
        // Comment management
        // ---------------------------------------

        addComment: (comment) =>
          set({
            comments: [
              ...get().comments,
              comment,
            ],
          }),

        // ---------------------------------------
        // Drag & drop
        // ---------------------------------------

        moveTask: (
          id,
          status,
          overId,
        ) => {
          const tasks = get().tasks;

          const moving = tasks.find(
            (task) =>
              task.id === id,
          );

          if (!moving) {
            return;
          }

          /*
           * Save the current state before
           * changing anything.
           *
           * This is what makes Undo possible.
           */
          const previousTasks =
            tasks.map((task) => ({
              ...task,
            }));

          const target = tasks
            .filter(
              (task) =>
                task.status ===
                  status &&
                task.id !== id,
            )
            .sort(
              (a, b) =>
                a.order - b.order,
            );

          const targetIndex = overId
            ? target.findIndex(
                (task) =>
                  task.id === overId,
              )
            : target.length;

          const safeIndex =
            targetIndex < 0
              ? target.length
              : targetIndex;

          const now =
            new Date().toISOString();

          target.splice(
            safeIndex,
            0,
            {
              ...moving,
              status,
              updatedAt: now,
              completedAt:
                status === 'done'
                  ? moving.completedAt ??
                    now
                  : null,
            },
          );

          const updates =
            new Map(
              target.map(
                (
                  task,
                  index,
                ) => [
                  task.id,
                  index + 1,
                ],
              ),
            );

          set({
            previousTasks,
            tasks: tasks.map(
              (task) =>
                updates.has(
                  task.id,
                )
                  ? {
                      ...task,
                      status,
                      order:
                        updates.get(
                          task.id,
                        )!,
                      updatedAt: now,
                      completedAt:
                        status ===
                        'done'
                          ? task.completedAt ??
                            now
                          : null,
                    }
                  : task,
            ),
          });
        },

        // ---------------------------------------
        // Reorder tasks
        // ---------------------------------------

        reorder: (
          activeId,
          overId,
        ) => {
          const tasks = get().tasks;

          const active =
            tasks.find(
              (task) =>
                task.id ===
                activeId,
            );

          const over =
            tasks.find(
              (task) =>
                task.id ===
                overId,
            );

          if (
            !active ||
            !over ||
            active.status !==
              over.status
          ) {
            return;
          }

          const column =
            tasks
              .filter(
                (task) =>
                  task.status ===
                  active.status,
              )
              .sort(
                (a, b) =>
                  a.order -
                  b.order,
              );

          const fromIndex =
            column.findIndex(
              (task) =>
                task.id ===
                activeId,
            );

          const toIndex =
            column.findIndex(
              (task) =>
                task.id ===
                overId,
            );

          if (
            fromIndex === -1 ||
            toIndex === -1 ||
            fromIndex === toIndex
          ) {
            return;
          }

          /*
           * Save current state before
           * changing the order.
           */
          const previousTasks =
            tasks.map((task) => ({
              ...task,
            }));

          const [item] =
            column.splice(
              fromIndex,
              1,
            );

          column.splice(
            toIndex,
            0,
            item,
          );

          const orderMap =
            new Map(
              column.map(
                (
                  task,
                  index,
                ) => [
                  task.id,
                  index + 1,
                ],
              ),
            );

          const now =
            new Date().toISOString();

          set({
            previousTasks,

            tasks: tasks.map(
              (task) =>
                orderMap.has(
                  task.id,
                )
                  ? {
                      ...task,
                      order:
                        orderMap.get(
                          task.id,
                        )!,
                      updatedAt: now,
                    }
                  : task,
            ),
          });
        },

        // ---------------------------------------
        // Undo
        // ---------------------------------------

        undoLastMove: () => {
          const previousTasks =
            get().previousTasks;

          if (!previousTasks) {
            return;
          }

          set({
            tasks: sortTasks(
              previousTasks,
            ),

            previousTasks: null,
          });
        },
      }),

      {
        name: 'sprintdesk-board',

        onRehydrateStorage: () =>
          (state) => {
            if (state) {
              state.hydrated = true;
            }
          },
      },
    ),
  );

export const createTask = (
  title: string,
  priority: Priority,
  assigneeId: number,
  dueDate: string,
): Task => {
  const now =
    new Date().toISOString();

  return {
    id: Date.now(),
    title,
    description: '',
    status: 'backlog',
    priority,
    assigneeId,
    dueDate,
    sprintId: 3,
    order: 999,
    createdAt: now,
    completedAt: null,
    updatedAt: now,
  };
};