import { useState } from 'react';
import type { MouseEvent } from 'react';

interface Task {
  id: string;
  title: string;
  importance: number;
  urgency: number;
}

interface GraphProps {
  onPositionSelect: (position: { x: number; y: number }) => void;
  existingTasks: Task[];
  selectedPosition: { x: number; y: number };
  showCategories?: boolean;
}

export function ImportanceUrgencyGraph({ onPositionSelect, existingTasks, selectedPosition, showCategories = true }: GraphProps) {
  const size = 500;
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = 100 - ((e.clientY - rect.top) / rect.height) * 100;

    onPositionSelect({ x: Math.round(x), y: Math.round(y) });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-4" style={{ marginRight: '84px' }}>
        {/* Left label for Importance */}
        <div className="flex items-center justify-center" style={{ width: '80px' }}>
          <span className="text-2xl font-bold whitespace-nowrap" style={{ transform: 'rotate(-90deg)' }}>
            Importance →
          </span>
        </div>

        <svg
          width={size}
          height={size}
          onClick={handleClick}
          className="border-2 border-gray-300 dark:border-gray-600 cursor-crosshair bg-white dark:bg-gray-800"
        >
        {/* Grid lines */}
        <line x1={size/2} y1="0" x2={size/2} y2={size} stroke="#d1d5db" strokeWidth="1" className="dark:stroke-gray-600" />
        <line x1="0" y1={size/2} x2={size} y2={size/2} stroke="#d1d5db" strokeWidth="1" className="dark:stroke-gray-600" />

        {/* Axes */}
        <line x1="0" y1={size} x2={size} y2={size} stroke="#374151" strokeWidth="2" className="dark:stroke-gray-400" />
        <line x1="0" y1="0" x2="0" y2={size} stroke="#374151" strokeWidth="2" className="dark:stroke-gray-400" />

        {/* Quadrant labels */}
        {showCategories && (
          <>
            <text x={size * 0.75} y="30" textAnchor="middle" className="text-xs font-semibold fill-red-600 dark:fill-red-400">
              DO FIRST
            </text>
            <text x={size * 0.25} y="30" textAnchor="middle" className="text-xs font-semibold fill-blue-600 dark:fill-blue-400">
              SCHEDULE
            </text>
            <text x={size * 0.75} y={size - 10} textAnchor="middle" className="text-xs font-semibold fill-yellow-600 dark:fill-yellow-400">
              DELEGATE
            </text>
            <text x={size * 0.25} y={size - 10} textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-400">
              ELIMINATE
            </text>
          </>
        )}


        {/* Existing tasks */}
        {existingTasks.map(task => {
          const cx = (task.urgency / 100) * size;
          const cy = (1 - task.importance / 100) * size;
          const tooltipWidth = Math.min(task.title.length * 8 + 16, 200);
          const tooltipHeight = 30;

          // Position tooltip to stay within bounds
          let tooltipX = cx + 10;
          let tooltipY = cy - 20;

          // If tooltip goes off right edge, position to left of dot
          if (tooltipX + tooltipWidth > size) {
            tooltipX = cx - tooltipWidth - 10;
          }

          // If tooltip goes off top edge, position below dot
          if (tooltipY < 0) {
            tooltipY = cy + 10;
          }

          // If tooltip goes off bottom edge, position above dot
          if (tooltipY + tooltipHeight > size) {
            tooltipY = cy - tooltipHeight - 10;
          }

          return (
            <g key={task.id}>
              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill="#6b7280"
                opacity="0.6"
                onMouseEnter={() => setHoveredTask(task)}
                onMouseLeave={() => setHoveredTask(null)}
                className="cursor-pointer hover:opacity-100 transition-opacity dark:fill-gray-400"
              />
              {hoveredTask?.id === task.id && (
                <g>
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    className="fill-white dark:fill-gray-700 stroke-gray-700 dark:stroke-gray-500"
                    strokeWidth="2"
                    rx="4"
                  />
                  <text
                    x={tooltipX + 8}
                    y={tooltipY + 18}
                    className="text-sm fill-gray-900 dark:fill-gray-100 pointer-events-none font-medium"
                    style={{ fontSize: '14px' }}
                  >
                    {task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Selected position */}
        <circle
          cx={(selectedPosition.x / 100) * size}
          cy={(1 - selectedPosition.y / 100) * size}
          r="8"
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth="2"
        />
      </svg>
      </div>

      {/* Bottom label for Urgency */}
      <div className="mt-6 text-center">
        <span className="text-2xl font-bold">
          Urgency →
        </span>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Position: Urgency {selectedPosition.x}, Importance {selectedPosition.y}
      </div>
    </div>
  );
}