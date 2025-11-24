import { Link } from "react-router";
import { useAuth } from "~/lib/auth-context";
import { ROUTES, LIMIT_MAX_USERS } from "~/lib/constants";

export default function Index() {
  const { user, initializing, signingOut } = useAuth();

  // Let global LoadingOverlay handle auth transitions
  if (initializing || signingOut) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100">PriorityMatrix</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl text-center">
        Organize your day using the Eisenhower Matrix. Categorize tasks by
        urgency and importance, then drag and drop them between columns as you
        make progress.
      </p>
      {user ? (
        <div className="flex flex-col gap-4 w-64">
          <Link to={ROUTES.TODOS}>
            <button className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 hover:scale-110 hover:rotate-2 transition-all duration-300 ease-out hover:shadow-2xl animate-bounce-subtle focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              See My Tasks
            </button>
          </Link>
          <Link to={ROUTES.ADD_TODO}>
            <button className="w-full py-4 px-6 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 hover:scale-110 hover:-rotate-2 transition-all duration-300 ease-out hover:shadow-2xl animate-float focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Add a Task
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-64">
          <Link to={ROUTES.LOGIN}>
            <button className="w-full py-4 px-6 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 hover:scale-105 transition-all duration-300 ease-out hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Sign In with Magic Link
            </button>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Access is limited to {LIMIT_MAX_USERS} users to maintain performance.
            New accounts are admitted on a first-come, first-served basis.
          </p>
        </div>
      )}
    </div>
  );
}
