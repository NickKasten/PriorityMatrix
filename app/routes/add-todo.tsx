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
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    navigate("/add-todo/position", {
      state: { title: title.trim(), dueDate },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pt-20">
      <Link
        to="/"
        className="fixed top-4 left-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        ← Back to Home
      </Link>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold">Add a New Todo</h1>

        <div>
          <label className="block text-sm font-medium mb-2">What needs to be done?</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task description"
            className="w-full px-4 py-3 border rounded-lg"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Due Date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Next: Position on Matrix
        </button>
      </form>
    </div>
  );
}
