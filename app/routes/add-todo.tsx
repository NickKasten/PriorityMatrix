import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import type { FormEvent } from "react";
import { useAuth } from "~/lib/auth-context";
import { ROUTES } from "~/lib/constants";

export default function AddTodo() {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    const redirectTarget =
      searchParams.get("redirect") ??
      `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    navigate(ROUTES.ADD_TODO_POSITION, {
      state: { title: title.trim(), dueDate },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pt-20 bg-gray-100 dark:bg-gray-900">
      <Link
        to={ROUTES.HOME}
        className="fixed top-4 left-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        ← Back to Home
      </Link>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add a New Todo</h1>

        <div>
          <label htmlFor="task-title" className="label">What needs to be done?</label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task description"
            className="input"
            autoFocus
            required
            aria-describedby="task-title-hint"
          />
          <p id="task-title-hint" className="sr-only">Enter a brief description of the task you want to add</p>
        </div>

        <div>
          <label htmlFor="task-due-date" className="label">Due Date (optional)</label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input"
            aria-describedby="due-date-hint"
          />
          <p id="due-date-hint" className="sr-only">Select a due date for the task, or leave empty if there is no deadline</p>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
        >
          Next: Position on Matrix
        </button>
      </form>
    </div>
  );
}
