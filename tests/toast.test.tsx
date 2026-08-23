import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';

import '@testing-library/jest-dom/vitest';

import {
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';

import { Toast } from '../src/components/feedback';
import { useUIStore } from '../src/store/uiStore';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    useUIStore.setState({
      toast: null,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('shows a toast message', () => {
    useUIStore
      .getState()
      .showToast(
        'Task created successfully',
        'success',
      );

    render(<Toast />);

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(
      'Task created successfully',
    );
  });

  it('clears the toast after 3.5 seconds', () => {
    useUIStore
      .getState()
      .showToast(
        'Task created successfully',
        'success',
      );

    render(<Toast />);

    expect(
      screen.getByRole('status'),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(
      screen.queryByRole('status'),
    ).not.toBeInTheDocument();
  });

  it('clears the toast when close is clicked', () => {
    useUIStore
      .getState()
      .showToast(
        'Something went wrong',
        'error',
      );

    render(<Toast />);

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(
      'Something went wrong',
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close notification',
      }),
    );

    expect(
      screen.queryByRole('status'),
    ).not.toBeInTheDocument();
  });

  it('runs the action and clears the toast', () => {
    const action = vi.fn();

    useUIStore
      .getState()
      .showToast(
        'Task moved',
        'info',
        {
          label: 'Undo',
          onClick: action,
        },
      );

    render(<Toast />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Undo',
      }),
    );

    expect(action).toHaveBeenCalledTimes(1);

    expect(
      screen.queryByRole('status'),
    ).not.toBeInTheDocument();
  });
});