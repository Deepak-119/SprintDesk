import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  createTask,
  useBoardStore,
} from '../src/store/boardStore';

describe('board store', () => {
  beforeEach(() => {
    useBoardStore.setState({
      tasks: [],
      hydrated: false,
    });
  });

  it('adds a task', () => {
    const task = createTask(
      'Test',
      'high',
      1,
      '2026-08-28',
    );

    useBoardStore
      .getState()
      .addTask(task);

    expect(
      useBoardStore.getState().tasks,
    ).toHaveLength(1);
  });

  it('moves a task between columns', () => {
    const task = createTask(
      'A',
      'low',
      1,
      '2026-08-28',
    );

    useBoardStore
      .getState()
      .setTasks([task]);

    useBoardStore
      .getState()
      .moveTask(
        task.id,
        'done',
      );

    expect(
      useBoardStore.getState().tasks[0]
        .status,
    ).toBe('done');
  });

  it('deletes a task', () => {
    const task = createTask(
      'A',
      'low',
      1,
      '2026-08-28',
    );

    useBoardStore
      .getState()
      .setTasks([task]);

    useBoardStore
      .getState()
      .deleteTask(task.id);

    expect(
      useBoardStore.getState().tasks,
    ).toHaveLength(0);
  });
});