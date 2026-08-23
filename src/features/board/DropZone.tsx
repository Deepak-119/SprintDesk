import type { ReactNode } from 'react';

import {
  useDroppable,
} from '@dnd-kit/core';

import type {
  TaskStatus,
} from '../../types';

interface DropZoneProps {
  id: TaskStatus;
  children: ReactNode;
}

export const DropZone = ({
  id,
  children,
}: DropZoneProps) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[420px] space-y-3 rounded-xl transition ${
        isOver
          ? 'bg-indigo-500/5 ring-2 ring-indigo-500/20'
          : ''
      }`}
    >
      {children}
    </div>
  );
};