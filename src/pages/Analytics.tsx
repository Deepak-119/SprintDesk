import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { Card } from '../components/ui';
import { useBoardStore } from '../store/boardStore';
import { useMockData } from '../hooks/useMockData';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const Analytics = () => {
  const tasks = useBoardStore(
    (state) => state.tasks,
  );

  const { data } = useMockData();

  /*
   * ---------------------------------------
   * Theme detection
   * ---------------------------------------
   */

  const [isDark, setIsDark] =
    useState(() =>
      document.documentElement.classList.contains(
        'dark',
      ),
    );

  useEffect(() => {
    const observer =
      new MutationObserver(() => {
        setIsDark(
          document.documentElement.classList.contains(
            'dark',
          ),
        );
      });

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ['class'],
      },
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  const sprints = data?.sprints ?? [];

  /*
   * ---------------------------------------
   * Sprint velocity
   * ---------------------------------------
   */

  const velocity = useMemo(
    () =>
      sprints.map((sprint) => ({
        name: sprint.name.replace(
          'Sprint ',
          'S',
        ),

        completed: tasks.filter(
          (task) =>
            task.sprintId === sprint.id &&
            task.status === 'done',
        ).length,
      })),
    [sprints, tasks],
  );

  /*
   * ---------------------------------------
   * Task status
   * ---------------------------------------
   */

  const status = useMemo(
    () =>
      [
        ['Backlog', 'backlog'],
        ['In Progress', 'in-progress'],
        ['Review', 'review'],
        ['Done', 'done'],
      ].map(([name, key]) => ({
        name,

        count: tasks.filter(
          (task) => task.status === key,
        ).length,
      })),
    [tasks],
  );

  /*
   * ---------------------------------------
   * Priority breakdown
   * ---------------------------------------
   */

  const priority = useMemo(
    () =>
      ['high', 'medium', 'low'].map(
        (value) => ({
          priority:
            value.charAt(0).toUpperCase() +
            value.slice(1),

          count: tasks.filter(
            (task) =>
              task.priority === value,
          ).length,
        }),
      ),
    [tasks],
  );

  /*
   * ---------------------------------------
   * Completion trend
   * ---------------------------------------
   */

  const trend = useMemo(() => {
    const byDay = new Map<
      string,
      number
    >();

    tasks
      .filter(
        (task) => task.completedAt,
      )
      .forEach((task) => {
        const date =
          task.completedAt!.slice(
            0,
            10,
          );

        byDay.set(
          date,
          (byDay.get(date) ?? 0) + 1,
        );
      });

    return [...byDay.entries()]
      .sort(
        ([dateA], [dateB]) =>
          dateA.localeCompare(dateB),
      )
      .map(
        ([date, completed]) => ({
          date: date.slice(5),
          completed,
        }),
      );
  }, [tasks]);

  /*
   * ---------------------------------------
   * Theme-aware chart colors
   * ---------------------------------------
   */

  const chartTextColor = isDark
    ? '#94a3b8'
    : '#64748b';

  const chartGridColor = isDark
    ? '#334155'
    : '#cbd5e1';

  const priorityBarColor = isDark
    ? '#818cf8'
    : '#0f172a';

  const tooltipBackground = isDark
    ? '#0f172a'
    : '#ffffff';

  const tooltipBorder = isDark
    ? '#334155'
    : '#e2e8f0';

  const tooltipText = isDark
    ? '#f8fafc'
    : '#0f172a';

  /*
   * ---------------------------------------
   * Donut label
   * ---------------------------------------
   *
   * Places the count inside the
   * corresponding donut segment.
   */

  const renderDonutLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
  }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    value?: number;
  }) => {
    if (
      cx === undefined ||
      cy === undefined ||
      midAngle === undefined ||
      innerRadius === undefined ||
      outerRadius === undefined ||
      value === undefined
    ) {
      return null;
    }

    const radius =
      innerRadius +
      (outerRadius - innerRadius) *
        0.55;

    const angle =
      (-midAngle * Math.PI) / 180;

    const x =
      cx + radius * Math.cos(angle);

    const y =
      cy + radius * Math.sin(angle);

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize={15}
        fontWeight={800}
      >
        {value}
      </text>
    );
  };

  /*
   * ---------------------------------------
   * Total tasks
   * ---------------------------------------
   */

  const totalTasks = status.reduce(
    (total, item) =>
      total + item.count,
    0,
  );

  return (
    <div>
      {/* -------------------------------- */}
      {/* Page heading */}
      {/* -------------------------------- */}

      <div className="mb-8">
        <p className="text-sm font-bold text-indigo-600">
          Sprint intelligence
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Analytics
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Every chart is derived from the live
          board state.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        {/* ================================= */}
        {/* Sprint velocity */}
        {/* ================================= */}

        <ChartCard
          title="Sprint velocity"
          subtitle="Completed tasks per sprint"
        >
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart data={velocity}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={chartGridColor}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: chartTextColor,
                }}
                axisLine={{
                  stroke: chartGridColor,
                }}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: chartTextColor,
                }}
                axisLine={{
                  stroke: chartGridColor,
                }}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    tooltipBackground,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '12px',
                  color: tooltipText,
                }}
                labelStyle={{
                  color: tooltipText,
                  fontWeight: 700,
                }}
                itemStyle={{
                  color: '#6366f1',
                  fontWeight: 600,
                }}
                cursor={{
                  fill: isDark
                    ? 'rgba(129, 140, 248, 0.10)'
                    : 'rgba(99, 102, 241, 0.08)',
                }}
              />

              <Bar
                dataKey="completed"
                fill="#4f46e5"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
                activeBar={{
                  fill: isDark
                    ? '#818cf8'
                    : '#6366f1',
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ================================= */}
        {/* Task status */}
        {/* ================================= */}

        <ChartCard
          title="Task status"
          subtitle="Current distribution"
        >
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <PieChart>

              <Pie
                data={status}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={4}
                labelLine={false}
                label={renderDonutLabel}
              >
                {status.map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        [
                          '#94a3b8',
                          '#3b82f6',
                          '#8b5cf6',
                          '#10b981',
                        ][index]
                      }
                    />
                  ),
                )}
              </Pie>

              {/* Center of donut */}

              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="central"
                fill={
                  isDark
                    ? '#f8fafc'
                    : '#0f172a'
                }
                fontSize={28}
                fontWeight={900}
              >
                {totalTasks}
              </text>

              <text
                x="50%"
                y="59%"
                textAnchor="middle"
                dominantBaseline="central"
                fill={chartTextColor}
                fontSize={12}
                fontWeight={600}
              >
                Total tasks
              </text>

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    tooltipBackground,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '12px',
                  color: tooltipText,
                }}
                labelStyle={{
                  color: tooltipText,
                  fontWeight: 700,
                }}
                itemStyle={{
                  color: isDark
                    ? '#c7d2fe'
                    : '#4338ca',
                  fontWeight: 700,
                }}
              />

              <Legend
                wrapperStyle={{
                  color: chartTextColor,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ================================= */}
        {/* Priority breakdown */}
        {/* ================================= */}

        <ChartCard
          title="Priority breakdown"
          subtitle="Work by priority"
        >
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart
              data={priority}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={chartGridColor}
              />

              <XAxis
                dataKey="priority"
                tick={{
                  fill: chartTextColor,
                }}
                axisLine={{
                  stroke: chartGridColor,
                }}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: chartTextColor,
                }}
                axisLine={{
                  stroke: chartGridColor,
                }}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    tooltipBackground,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '12px',
                  color: tooltipText,
                }}
                labelStyle={{
                  color: tooltipText,
                  fontWeight: 700,
                }}
                itemStyle={{
                  color: isDark
                    ? '#c7d2fe'
                    : '#4338ca',
                  fontWeight: 700,
                }}
                cursor={{
                  fill: isDark
                    ? 'rgba(129, 140, 248, 0.10)'
                    : 'rgba(99, 102, 241, 0.08)',
                }}
              />

              <Bar
                dataKey="count"
                fill={priorityBarColor}
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
                activeBar={{
                  fill: isDark
                    ? '#a5b4fc'
                    : '#4338ca',
                }}
                label={{
                  position: 'top',
                  fill: isDark
                    ? '#f8fafc'
                    : '#0f172a',
                  fontSize: 14,
                  fontWeight: 800,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ================================= */}
        {/* Completion trend */}
        {/* ================================= */}

        <ChartCard
          title="Completion trend"
          subtitle="Completed tasks over time"
        >
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <LineChart data={trend}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={chartGridColor}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fill: chartTextColor,
                }}
                axisLine={{
                  stroke: chartGridColor,
                }}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: chartTextColor,
                }}
                axisLine={{
                  stroke: chartGridColor,
                }}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    tooltipBackground,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '12px',
                  color: tooltipText,
                }}
                labelStyle={{
                  color: tooltipText,
                  fontWeight: 700,
                }}
                itemStyle={{
                  color: '#6366f1',
                  fontWeight: 700,
                }}
              />

              <Line
                type="monotone"
                dataKey="completed"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#4f46e5',
                }}
                activeDot={{
                  r: 6,
                  fill: '#818cf8',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

/*
 * ---------------------------------------
 * Chart Card
 * ---------------------------------------
 */

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <Card className="p-5">
    <h2 className="font-black">
      {title}
    </h2>

    <p className="mb-3 text-xs text-slate-400">
      {subtitle}
    </p>

    {children}
  </Card>
);