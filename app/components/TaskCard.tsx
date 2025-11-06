import { useDraggable } from "@dnd-kit/core";
import { format, parseISO } from "date-fns";
import { useState, type MouseEvent } from "react";
import type { Todo } from "~/types/todo";

interface TaskCardProps {
  task: Todo;
  onDelete(taskId: string): Promise<void>;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    await onDelete(task.id);
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow relative group"
      >
        <div {...listeners} {...attributes} className="cursor-move">
          <h3 className="font-semibold mb-2 pr-6 text-gray-800 dark:text-gray-100">
            {task.title}
          </h3>

          <div className="flex gap-2 text-xs text-gray-600 mb-2">
            <span className="bg-blue-100 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded">
              I: {task.importance}
            </span>
            <span className="bg-orange-100 dark:bg-orange-900 dark:text-orange-100 px-2 py-1 rounded">
              U: {task.urgency}
            </span>
          </div>

          {task.due_date && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Due: {format(parseISO(task.due_date), "MMM d, yyyy")}
            </p>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-error-500 text-white rounded-md w-8 h-8 flex items-center justify-center hover:bg-error-600 hover:scale-110 shadow-sm"
          title="Delete task"
          aria-label="Delete task"
        >
          <span className="text-xl leading-none font-bold">×</span>
        </button>
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-hard max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Delete Task
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Are you sure you want to delete this task?
            </p>
            <p className="text-gray-900 dark:text-gray-100 font-semibold mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              "{task.title}"
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-error-500 text-white rounded-lg font-semibold hover:bg-error-600 transition-all focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
