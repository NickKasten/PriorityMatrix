import { useLoaderData, useFetcher, Link } from 'react-router';
import type { Route } from './+types/todos';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { createServerClient } from '~/lib/supabase.server';
import { sortByPriority } from '~/lib/utils';
import { TodoColumn } from '~/components/TodoColumn';

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createServerClient();
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  const allTodos = todos || [];

  return {
    todoTasks: allTodos.filter(t => t.status === 'todo').sort(sortByPriority),
    scheduledTasks: allTodos.filter(t => t.status === 'scheduled'),
    completedTasks: allTodos.filter(t => t.status === 'completed'),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const taskId = formData.get('taskId') as string;
  const action = formData.get('action') as string;
  const newStatus = formData.get('status') as string;

  const supabase = createServerClient();

  if (action === 'delete') {
    await supabase
      .from('todos')
      .delete()
      .eq('id', taskId);
  } else {
    const updateData: any = { status: newStatus };
    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('todos')
      .update(updateData)
      .eq('id', taskId);
  }

  return { success: true };
}

export default function Todos() {
  const { todoTasks, scheduledTasks, completedTasks } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    fetcher.submit(
      { taskId, status: newStatus },
      { method: 'post' }
    );
  };

  return (
    <div className="min-h-screen p-8 pt-20">
      <Link
        to="/"
        className="fixed top-4 left-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        ← Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Tasks</h1>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TodoColumn id="todo" title="To Do" tasks={todoTasks} />
          <TodoColumn id="scheduled" title="Scheduled" tasks={scheduledTasks} />
          <TodoColumn id="completed" title="Completed" tasks={completedTasks} />
        </div>
      </DndContext>
    </div>
  );
}