import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "~/lib/auth-context";

export function AccountMenu() {
  const { user, initializing, signingOut, transitioning, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Hide during auth transitions to prevent flashing
  if (initializing || signingOut || transitioning) {
    return null;
  }

  if (!user) {
    const redirectPath =
      location.pathname === "/" ? "/todos" : location.pathname + location.search;
    return (
      <Link
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        className="fixed top-4 right-20 z-50 px-4 py-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition"
      >
        Sign In
      </Link>
    );
  }

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    // Delay navigation to allow smooth transition overlay
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 350);
  };

  const displayName = user.email ?? "Account";

  return (
    <div className="fixed top-4 right-20 z-50">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition flex items-center gap-2"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {displayName}
        </span>
      </button>
      {open && (
        <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-hard py-2 w-56">
          <Link
            to="/todos"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            My Tasks
          </Link>
          <Link
            to="/add-todo"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Add Task
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-600/20"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
