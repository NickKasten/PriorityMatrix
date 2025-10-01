import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import type { Todo } from '~/types/todo';

interface TodoColumnProps {
  id: string;
  title: string;
  tasks: Todo[];
}

export function TodoColumn({ id, title, tasks }: TodoColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Column-specific colors
  const colorMap = {
    todo: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800',
      header: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100',
      hoverBg: 'bg-red-100 dark:bg-red-900/40',
      ring: 'ring-red-500'
    },
    scheduled: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      header: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100',
      hoverBg: 'bg-blue-100 dark:bg-blue-900/40',
      ring: 'ring-blue-500'
    },
    completed: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      header: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100',
      hoverBg: 'bg-green-100 dark:bg-green-900/40',
      ring: 'ring-green-500'
    }
  };

  const colors = colorMap[id as keyof typeof colorMap] || colorMap.todo;

  return (
    <div
      ref={setNodeRef}
      className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 min-h-[400px] shadow-md transition-all ${
        isOver ? `${colors.hoverBg} ring-2 ${colors.ring}` : ''
      }`}
    >
      <div className={`${colors.header} rounded-lg px-4 py-3 mb-4 shadow-sm`}>
        <h2 className="text-xl font-bold flex items-center justify-between">
          {title}
          <span className="text-sm font-semibold opacity-75">({tasks.length})</span>
        </h2>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}