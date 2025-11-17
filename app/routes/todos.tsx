import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { supabaseClient } from "~/lib/supabase.client";
import { sortByPriority } from "~/lib/utils";
import { TodoColumn } from "~/components/TodoColumn";
import type { Todo } from "~/types/todo";
import { useAuth } from "~/lib/auth-context";

type TaskStatus = "todo" | "scheduled" | "completed";

export default function Todos() {
  const { user, initializing, signingOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setInfo(null);
    const { data, error: fetchError } = await supabaseClient
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setTodos(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!initializing && !signingOut && user) {
      void fetchTodos();
    } else if (!initializing && !signingOut && !user) {
      setLoading(false);
    }
  }, [fetchTodos, initializing, signingOut, user]);

  const categorized = useMemo(() => {
    const todo = todos
      .filter((task) => task.status === "todo")
      .sort(sortByPriority);
    const scheduled = todos.filter((task) => task.status === "scheduled");
    const completed = todos.filter((task) => task.status === "completed");

    return { todo, scheduled, completed };
  }, [todos]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;

    const currentTask = todos.find((task) => task.id === taskId);

    if (!currentTask || currentTask.status === newStatus) {
      return;
    }

    const optimistic = todos.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            completed_at:
              newStatus === "completed"
                ? new Date().toISOString()
                : task.completed_at,
          }
        : task
    );

    setTodos(optimistic);
    setInfo(null);

    const updateData: Partial<Todo> = { status: newStatus };
    if (newStatus === "completed") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    const { error: updateError } = await supabaseClient
      .from("todos")
      .update(updateData)
      .eq("id", taskId);

    if (updateError) {
      setError(updateError.message);
      void fetchTodos();
    }
  };

  const handleDelete = async (taskId: string) => {
    const { error: deleteError } = await supabaseClient
      .from("todos")
      .delete()
      .eq("id", taskId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTodos((prev) => prev.filter((task) => task.id !== taskId));
    setInfo("Task deleted.");
  };

  // Let global LoadingOverlay handle auth transitions
  if (initializing || signingOut) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login?redirect=/todos" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-20">
      <Link
        to="/"
        className="fixed top-4 left-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        ← Back to Home
      </Link>

      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        {info && (
          <div className="bg-info-100 text-info-600 px-4 py-3 rounded-lg">
            {info}
          </div>
        )}
        {error && (
          <div className="bg-error-100 text-error-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TodoColumn
            id="todo"
            title="To Do"
            tasks={categorized.todo}
            onDelete={handleDelete}
          />
          <TodoColumn
            id="scheduled"
            title="Scheduled"
            tasks={categorized.scheduled}
            onDelete={handleDelete}
          />
          <TodoColumn
            id="completed"
            title="Completed"
            tasks={categorized.completed}
            onDelete={handleDelete}
          />
        </div>
      </DndContext>
    </div>
  );
}
