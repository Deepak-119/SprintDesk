
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge, Card } from '../components/ui';
import { useMockData } from '../hooks/useMockData';
import { useBoardStore } from '../store/boardStore';
import { useUIStore } from '../store/uiStore';

export const Dashboard = () => {
  const { data, isLoading } = useMockData();

  const tasks = useBoardStore((state) => state.tasks);
  const setTasks = useBoardStore((state) => state.setTasks);
  const hydrated = useBoardStore((state) => state.hydrated);

  const setDrawerTaskId = useUIStore(
    (state) => state.setDrawerTaskId,
  );

  const navigate = useNavigate();

  /*
   * Initialize the board only after persisted Zustand
   * state has been restored.
   */
  useEffect(() => {
    if (!data || !hydrated || tasks.length > 0) {
      return;
    }

    setTasks(data.tasks);
  }, [data, hydrated, tasks.length, setTasks]);

  /*
   * Sprint 3 is the currently active sprint in the
   * supplied mock data.
   */
  const sprint = useMemo(
    () =>
      data?.sprints.find(
        (currentSprint) => currentSprint.id === 3,
      ),
    [data?.sprints],
  );

  /*
   * Dashboard metrics are intentionally scoped to
   * the current sprint instead of mixing all 30 tasks.
   */
  const sprintTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.sprintId === sprint?.id,
      ),
    [tasks, sprint?.id],
  );

  const stats = useMemo(() => {
    const today = '2026-08-21';

    return {
      done: sprintTasks.filter(
        (task) => task.status === 'done',
      ).length,

      active: sprintTasks.filter(
        (task) => task.status !== 'done',
      ).length,

      high: sprintTasks.filter(
        (task) =>
          task.priority === 'high' &&
          task.status !== 'done',
      ).length,

      overdue: sprintTasks.filter(
        (task) =>
          task.status !== 'done' &&
          task.dueDate < today,
      ).length,
    };
  }, [sprintTasks]);

  const completionPercentage = sprintTasks.length
    ? Math.round(
        (stats.done / sprintTasks.length) * 100,
      )
    : 0;

  const recentTasks = useMemo(
    () =>
      [...sprintTasks]
        .sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        )
        .slice(0, 5),
    [sprintTasks],
  );

  const sprintLabel = sprint
    ? `${sprint.name} · ${sprint.startDate.slice(5)}–${sprint.endDate.slice(5)}`
    : 'Current sprint';

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-indigo-600">
            {sprintLabel}
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
            Good afternoon.
          </h1>

          <p className="mt-2 text-slate-500">
            Here’s what is happening across the sprint.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/board')}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Open sprint board →
        </button>
      </div>

      {isLoading || !hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Card
                key={item}
                className="h-32 animate-pulse bg-slate-100 dark:bg-slate-900"
            >
            <div className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Completed', stats.done, 'green'],
              ['Active work', stats.active, 'blue'],
              ['High priority', stats.high, 'red'],
              ['Overdue', stats.overdue, 'amber'],
            ].map(([label, value, tone]) => (
              <Card
                key={label}
                className="p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-500">
                    {label}
                  </p>

                  <Badge
                    tone={
                      tone as
                        | 'green'
                        | 'blue'
                        | 'red'
                        | 'amber'
                    }
                  >
                    Sprint 3
                  </Badge>
                </div>

                <p className="mt-5 text-4xl font-black">
                  {value}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black">
                    Latest activity
                  </h2>

                  <p className="text-sm text-slate-400">
                    Recently updated tasks
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/board')}
                  className="text-sm font-bold text-indigo-600"
                >
                  View all
                </button>
              </div>

              <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
                {recentTasks.map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() =>
                      setDrawerTaskId(task.id)
                    }
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {task.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        Updated{' '}
                        {new Date(
                          task.updatedAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <Badge
                      tone={
                        task.status === 'done'
                          ? 'green'
                          : task.priority === 'high'
                            ? 'red'
                            : 'slate'
                      }
                    >
                      {task.status}
                    </Badge>
                  </button>
                ))}

                {recentTasks.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No tasks in this sprint yet.
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-black">
                Sprint health
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Completion against current scope
              </p>

              <div className="mt-8 grid place-items-center">
                <div
                  className="grid h-40 w-40 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #4f46e5 ${completionPercentage}%,
                      #e2e8f0 0
                    )`,
                  }}
                >
                  <div className="grid h-32 w-32 place-items-center rounded-full bg-white dark:bg-slate-900">
                    <div className="text-center">
                      <p className="text-3xl font-black">
                        {completionPercentage}%
                      </p>

                      <p className="text-[11px] font-semibold text-slate-400">
                        complete
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between text-xs">
                <span className="text-slate-400">
                  {stats.done} done
                </span>

                <span className="font-bold">
                  {sprintTasks.length} total
                </span>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
