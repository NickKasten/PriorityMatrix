import { Link } from 'react-router';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Task Manager</h1>
      <div className="flex flex-col gap-4 w-64">
        <Link to="/todos">
          <button className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 hover:scale-110 hover:rotate-2 transition-all duration-300 ease-out hover:shadow-2xl animate-bounce-subtle">
            See List of Todos
          </button>
        </Link>
        <Link to="/add-todo">
          <button className="w-full py-4 px-6 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 hover:scale-110 hover:-rotate-2 transition-all duration-300 ease-out hover:shadow-2xl animate-float">
            Add a Todo
          </button>
        </Link>
      </div>
    </div>
  );
}