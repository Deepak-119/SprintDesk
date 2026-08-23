import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import { TaskCard } from '../features/board/TaskCard';
import { DropZone } from '../features/board/DropZone';
import { TaskDrawer } from '../features/board/TaskDrawer';

import {
  Button,
  Card,
  Input,
  Select,
} from '../components/ui';

import { useMockData } from '../hooks/useMockData';

import {
  createTask,
  useBoardStore,
} from '../store/boardStore';

import { useUIStore } from '../store/uiStore';

import type {
  Priority,
  Task,
  TaskStatus,
} from '../types';

const columns: [TaskStatus, string][] = [
  ['backlog', 'Backlog'],
  ['in-progress', 'In Progress'],
  ['review', 'Review'],
  ['done', 'Done'],
];

export const Board = () => {
  const { data, isLoading } = useMockData();

  /*
   * -----------------------------
   * Board store
   * -----------------------------
   */

  const tasks = useBoardStore(
    (state) => state.tasks,
  );

  const setTasks = useBoardStore(
    (state) => state.setTasks,
  );

  const moveTask = useBoardStore(
    (state) => state.moveTask,
  );

  const reorder = useBoardStore(
    (state) => state.reorder,
  );

  const hydrated = useBoardStore(
    (state) => state.hydrated,
  );

  const addTask = useBoardStore(
    (state) => state.addTask,
  );

  /*
   * -----------------------------
   * UI store
   * -----------------------------
   */

  const openDrawer = useUIStore(
    (state) => state.setDrawerTaskId,
  );

  const showToast = useUIStore(
    (state) => state.showToast,
  );

  /*
   * -----------------------------
   * Drag state
   * -----------------------------
   */

  const [activeTaskId, setActiveTaskId] =
    useState<number | null>(null);

  /*
   * Snapshot of the board before
   * a drag starts.
   *
   * We use this for Undo.
   */
  const [previousTasks, setPreviousTasks] =
    useState<Task[] | null>(null);

  /*
   * -----------------------------
   * Filters
   * -----------------------------
   */

  const [priorityFilter, setPriorityFilter] =
    useState('all');

  const [assigneeFilter, setAssigneeFilter] =
    useState('all');

  /*
   * -----------------------------
   * Create task state
   * -----------------------------
   */

  const [showCreate, setShowCreate] =
    useState(false);

  const [title, setTitle] =
    useState('');

  const [newPriority, setNewPriority] =
    useState<Priority>('medium');

  const [newAssignee, setNewAssignee] =
    useState(1);

  const [dueDate, setDueDate] =
    useState('2026-08-28');

  /*
   * -----------------------------
   * Drag sensors
   * -----------------------------
   */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  /*
   * -----------------------------
   * Seed initial board
   * -----------------------------
   */

  useEffect(() => {
    if (
      !data ||
      !hydrated ||
      tasks.length > 0
    ) {
      return;
    }

    setTasks(data.tasks);
  }, [
    data,
    hydrated,
    tasks.length,
    setTasks,
  ]);

  /*
   * -----------------------------
   * Filter tasks
   * -----------------------------
   */

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesPriority =
        priorityFilter === 'all' ||
        task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === 'all' ||
        String(task.assigneeId) ===
          assigneeFilter;

      return (
        matchesPriority &&
        matchesAssignee
      );
    });
  }, [
    tasks,
    priorityFilter,
    assigneeFilter,
  ]);

  /*
   * -----------------------------
   * Currently dragged task
   * -----------------------------
   */

  const activeTask = useMemo(
    () =>
      tasks.find(
        (task) =>
          task.id === activeTaskId,
      ),
    [tasks, activeTaskId],
  );

  /*
   * -----------------------------
   * Drag start
   * -----------------------------
   *
   * Save the complete board state.
   * If the user clicks Undo later,
   * we restore this snapshot.
   */

  const handleDragStart = () => {
    setPreviousTasks(
      tasks.map((task) => ({
        ...task,
      })),
    );
  };

  /*
   * -----------------------------
   * Drag cancel
   * -----------------------------
   */

  const handleDragCancel = () => {
    setActiveTaskId(null);
    setPreviousTasks(null);
  };

  /*
   * -----------------------------
   * Drag end
   * -----------------------------
   */

  const handleDragEnd = ({
    active,
    over,
  }: DragEndEvent) => {
    setActiveTaskId(null);

    if (!over) {
      setPreviousTasks(null);
      return;
    }

    const activeId = Number(
      active.id,
    );

    const overId = Number(
      over.id,
    );

    const currentTask =
      tasks.find(
        (task) =>
          task.id === activeId,
      );

    if (!currentTask) {
      setPreviousTasks(null);
      return;
    }

    /*
     * Find the task we dropped onto.
     */
    const overTask =
      tasks.find(
        (task) =>
          task.id === overId,
      );

    /*
     * -----------------------------
     * Move / reorder task
     * -----------------------------
     */

    if (overTask) {
      if (
        currentTask.status ===
        overTask.status
      ) {
        /*
         * Same column:
         * change ordering.
         */
        reorder(
          currentTask.id,
          overTask.id,
        );
      } else {
        /*
         * Different column:
         * change status + position.
         */
        moveTask(
          currentTask.id,
          overTask.status,
          overTask.id,
        );
      }
    } else {
      /*
       * Dropped directly onto a column.
       */

      const column =
        columns.find(
          ([status]) =>
            status ===
            String(over.id),
        );

      if (column) {
        moveTask(
          currentTask.id,
          column[0],
        );
      }
    }

    /*
     * Get the latest state from Zustand.
     *
     * The `tasks` variable above is from the
     * previous React render, so we use
     * getState() to get the updated board.
     */

    const updatedTasks =
      useBoardStore.getState().tasks;

    const updatedTask =
      updatedTasks.find(
        (task) =>
          task.id === activeId,
      );

    /*
     * Check whether the task actually
     * changed its position/status.
     */

    const positionChanged =
      updatedTask &&
      (
        updatedTask.status !==
          currentTask.status ||
        updatedTask.order !==
          currentTask.order
      );

    /*
     * -----------------------------
     * Show Undo toast
     * -----------------------------
     */

    if (
      positionChanged &&
      previousTasks
    ) {
      const oldTasks =
        previousTasks;

      const oldTask =
        oldTasks.find(
          (task) =>
            task.id === activeId,
        );

      showToast(
        oldTask
          ? `Task moved from ${formatStatus(
              currentTask.status,
            )} to ${formatStatus(
              updatedTask.status,
            )}`
          : 'Task position updated',
        'success',
        {
          label: 'Undo',

          onClick: () => {
            setTasks(oldTasks);
          },
        },
      );
    }

    setPreviousTasks(null);
  };

  /*
   * -----------------------------
   * Create task
   * -----------------------------
   */

  const handleCreateTask = () => {
    const trimmedTitle =
      title.trim();

    if (!trimmedTitle) {
      return;
    }

    addTask(
      createTask(
        trimmedTitle,
        newPriority,
        newAssignee,
        dueDate,
      ),
    );

    setTitle('');
    setNewPriority('medium');

    setNewAssignee(
      data?.users[0]?.id ?? 1,
    );

    setDueDate('2026-08-28');
    setShowCreate(false);

    showToast(
      'Task created successfully',
      'success',
    );
  };

  /*
   * -----------------------------
   * Render
   * -----------------------------
   */

  return (
    <div>
      {/* -----------------------------
          Header
      ----------------------------- */}

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">
            Sprint Board · {tasks.length}{' '}
            tasks
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Sprint Board
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Drag tasks across stages. Click
            any card to edit details.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All priorities
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </Select>

          <Select
            value={assigneeFilter}
            onChange={(event) =>
              setAssigneeFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All assignees
            </option>

            {data?.users.map(
              (user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name}
                </option>
              ),
            )}
          </Select>

          <Button
            onClick={() =>
              setShowCreate(true)
            }
          >
            + New task
          </Button>
        </div>
      </div>

      {/* -----------------------------
          Loading
      ----------------------------- */}

      {isLoading || !hydrated ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {columns.map(
            ([status]) => (
              <div
                key={status}
                className="h-[420px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
              />
            ),
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(event) => {
            setActiveTaskId(
              Number(
                event.active.id,
              ),
            );

            handleDragStart();
          }}
          onDragCancel={
            handleDragCancel
          }
          onDragEnd={
            handleDragEnd
          }
        >
          {/* -----------------------------
              Kanban columns
          ----------------------------- */}

          <div className="grid gap-4 overflow-x-auto pb-4 lg:grid-cols-4">
            {columns.map(
              ([status, label]) => {
                const columnTasks =
                  filteredTasks
                    .filter(
                      (task) =>
                        task.status ===
                        status,
                    )
                    .sort(
                      (a, b) =>
                        a.order -
                        b.order,
                    );

                return (
                  <div
                    key={status}
                    id={status}
                    className="min-w-[280px] rounded-2xl bg-slate-100/80 p-3 dark:bg-slate-900/70"
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black">
                          {label}
                        </span>

                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
                          {
                            columnTasks.length
                          }
                        </span>
                      </div>

                      <span className="text-slate-300">
                        ⋯
                      </span>
                    </div>

                    <DropZone id={status}>
                      {columnTasks.map(
                        (task) => (
                          <TaskCard
                            key={
                              task.id
                            }
                            task={
                              task
                            }
                            user={data?.users.find(
                              (
                                user,
                              ) =>
                                user.id ===
                                task.assigneeId,
                            )}
                            onOpen={() =>
                              openDrawer(
                                task.id,
                              )
                            }
                          />
                        ),
                      )}
                    </DropZone>
                  </div>
                );
              },
            )}
          </div>

          {/* -----------------------------
              Drag preview
          ----------------------------- */}

          <DragOverlay>
            {activeTask ? (
              <div className="w-72 rotate-2">
                <TaskCard
                  task={
                    activeTask
                  }
                  user={data?.users.find(
                    (user) =>
                      user.id ===
                      activeTask.assigneeId,
                  )}
                  onOpen={() =>
                    undefined
                  }
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* -----------------------------
          Task drawer
      ----------------------------- */}

      <TaskDrawer />

      {/* -----------------------------
          Create task modal
      ----------------------------- */}

      {showCreate && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-task-title"
        >
          <Card className="w-full max-w-lg p-6">
            <div className="flex justify-between">
              <div>
                <h2
                  id="create-task-title"
                  className="text-xl font-black"
                >
                  Create task
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Add work to the backlog.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close create task dialog"
                onClick={() =>
                  setShowCreate(false)
                }
                className="text-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label>
                <span className="mb-2 block text-sm font-bold">
                  Title
                </span>

                <Input
                  autoFocus
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Improve empty state"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-bold">
                    Priority
                  </span>

                  <Select
                    className="w-full"
                    value={
                      newPriority
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewPriority(
                        event.target
                          .value as Priority,
                      )
                    }
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
                    Assignee
                  </span>

                  <Select
                    className="w-full"
                    value={
                      newAssignee
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewAssignee(
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                  >
                    {data?.users.map(
                      (user) => (
                        <option
                          key={
                            user.id
                          }
                          value={
                            user.id
                          }
                        >
                          {
                            user.name
                          }
                        </option>
                      ),
                    )}
                  </Select>
                </label>
              </div>

              <label>
                <span className="mb-2 block text-sm font-bold">
                  Due date
                </span>

                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target
                        .value,
                    )
                  }
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setShowCreate(
                      false,
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  disabled={
                    !title.trim()
                  }
                  onClick={
                    handleCreateTask
                  }
                >
                  Create task
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

/*
 * Convert internal task status
 * into a user-friendly label.
 */

const formatStatus = (
  status: TaskStatus,
) => {
  switch (status) {
    case 'backlog':
      return 'Backlog';

    case 'in-progress':
      return 'In Progress';

    case 'review':
      return 'Review';

    case 'done':
      return 'Done';

    default:
      return status;
  }
};