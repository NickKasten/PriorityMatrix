import { useState } from 'react';
import { useLoaderData, useLocation, Form, redirect } from 'react-router';
import type { Route } from './+types/add-todo.position';
import { createServerClient } from '~/lib/supabase.server';
import { ImportanceUrgencyGraph } from '~/components/ImportanceUrgencyGraph';

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createServerClient();
  const { data: todos } = await supabase
    .from('todos')
    .select('id, title, importance, urgency')
    .neq('status', 'completed');

  return { todos: todos || [] };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const supabase = createServerClient();

  const newTodo = {
    title: formData.get('title') as string,
    due_date: formData.get('dueDate') as string || null,
    importance: parseInt(formData.get('importance') as string),
    urgency: parseInt(formData.get('urgency') as string),
    status: 'todo' as const,
    position: 0,
  };

  const { error } = await supabase.from('todos').insert(newTodo);

  if (error) throw error;
  return redirect('/add-todo/saving');
}

export default function PositionTodo() {
  const { todos } = useLoaderData<typeof loader>();
  const location = useLocation();
  const { title, dueDate } = location.state as { title: string; dueDate: string };

  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [showExisting, setShowExisting] = useState(false);
  const [showCategories, setShowCategories] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pt-20">
      <Form action="/add-todo" className="fixed top-4 left-4">
        <button
          type="submit"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← Back to Home
        </button>
      </Form>

      <h1 className="text-3xl font-bold mb-2">Position Your Task</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        <span className="font-semibold">Current Task:</span> "{title}"
      </p>

      <div className="mb-6 flex gap-4">
        <button
          type="button"
          onClick={() => setShowExisting(!showExisting)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {showExisting ? 'Hide' : 'Show'} Existing Tasks
        </button>
        <button
          type="button"
          onClick={() => setShowCategories(!showCategories)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {showCategories ? 'Hide' : 'Show'} Category Names
        </button>
      </div>

      <ImportanceUrgencyGraph
        onPositionSelect={setPosition}
        existingTasks={showExisting ? todos : []}
        selectedPosition={position}
        showCategories={showCategories}
      />

      <Form method="post" className="mt-8">
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="dueDate" value={dueDate} />
        <input type="hidden" name="importance" value={position.y} />
        <input type="hidden" name="urgency" value={position.x} />
        <button
          type="submit"
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          Confirm Position
        </button>
      </Form>
    </div>
  );
}