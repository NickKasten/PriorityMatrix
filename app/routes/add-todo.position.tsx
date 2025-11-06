import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { ImportanceUrgencyGraph } from "~/components/ImportanceUrgencyGraph";
import { supabaseClient } from "~/lib/supabase.client";
import { useAuth } from "~/lib/auth-context";

interface LocationState {
  title: string;
  dueDate: string;
}

interface GraphTask {
  id: string;
  title: string;
  importance: number;
  urgency: number;
}

export default function PositionTodo() {
  const { state } = useLocation() as { state: LocationState | undefined };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, initializing } = useAuth();

  const [existingTasks, setExistingTasks] = useState<GraphTask[]>([]);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [showExisting, setShowExisting] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = state?.title;
  const dueDate = state?.dueDate ?? "";

  useEffect(() => {
    if (!initializing && !user) {
      const redirectTarget =
        searchParams.get("redirect") ??
        `/add-todo/position${window.location.search}${window.location.hash}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`, {
        replace: true,
      });
    }
  }, [initializing, navigate, searchParams, user]);

  useEffect(() => {
    if (!state?.title) {
      navigate("/add-todo", { replace: true });
    }
  }, [navigate, state]);

  useEffect(() => {
    if (!user) return;
    const fetchExisting = async () => {
      const { data, error: fetchError } = await supabaseClient
        .from("todos")
        .select("id, title, importance, urgency")
        .neq("status", "completed")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setExistingTasks(data ?? []);
      }
    };

    void fetchExisting();
  }, [user]);

  const pendingTaskCount = useMemo(() => existingTasks.length, [existingTasks]);

  const handleSubmit = async () => {
    if (!title) return;
    if (!user) {
      navigate("/login?redirect=/add-todo/position", { replace: true });
      return;
    }
    setSaving(true);
    setError(null);

    const { error: insertError } = await supabaseClient.from("todos").insert({
      title,
      due_date: dueDate || null,
      importance: position.y,
      urgency: position.x,
      status: "todo",
      position: 0,
      user_id: user.id,
    });

    if (insertError) {
      if (insertError.message.includes("TASK_RATE_LIMIT")) {
        setError(
          "Easy there! You can only add one task per second. Please try again."
        );
      } else if (insertError.message.includes("TASK_CAP_REACHED")) {
        setError(
          "You already have 30 active tasks. Complete or delete one before adding another."
        );
      } else {
        setError(insertError.message);
      }
      setSaving(false);
      return;
    }

    navigate("/todos", { replace: true });
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=/add-todo/position" replace />;
  }

  if (!title) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pt-20">
      <Link
        to="/add-todo"
        className="fixed top-4 left-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Position Your Task</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 text-center">
        <span className="font-semibold">Current Task:</span> "{title}"
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Active tasks (excluding completed): {pendingTaskCount}
      </p>

      <div className="mb-6 flex gap-4 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => setShowExisting((prev) => !prev)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {showExisting ? "Hide" : "Show"} Existing Tasks
        </button>
        <button
          type="button"
          onClick={() => setShowCategories((prev) => !prev)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {showCategories ? "Hide" : "Show"} Category Names
        </button>
      </div>

      {pendingTaskCount >= 30 && (
        <div className="mb-6 max-w-lg w-full bg-warning-100 text-warning-600 px-4 py-3 rounded-lg text-center">
          You have 30 active tasks. Complete or remove a task before adding a
          new one.
        </div>
      )}

      {error && (
        <div className="mb-6 max-w-lg w-full bg-error-100 text-error-600 px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      )}

      <ImportanceUrgencyGraph
        onPositionSelect={setPosition}
        existingTasks={showExisting ? existingTasks : []}
        selectedPosition={position}
        showCategories={showCategories}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving || pendingTaskCount >= 30}
        className="mt-8 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
      >
        {saving ? "Saving…" : "Confirm Position"}
      </button>
    </div>
  );
}
