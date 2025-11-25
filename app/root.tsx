import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ThemeToggle } from "./components/ThemeToggle";
import { AccountMenu } from "./components/AccountMenu";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { ROUTES, STORAGE_KEY_GH_PAGES_REDIRECT } from "./lib/constants";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeToggle />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LoadingOverlay />
      <AccountMenu />
      <GitHubPagesRedirect />
      <CapacityWatcher />
      <Outlet />
    </AuthProvider>
  );
}

function LoadingOverlay() {
  const { initializing, signingOut } = useAuth();

  if (!initializing && !signingOut) {
    return null;
  }

  const message = signingOut ? "Signing out..." : "Loading...";

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
        {message}
      </p>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

function GitHubPagesRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get("redirect");
    const storedPath = sessionStorage.getItem(STORAGE_KEY_GH_PAGES_REDIRECT);

    // Only process redirect param if sessionStorage flag is also set.
    // This ensures we only handle actual GitHub Pages 404 redirects
    // and not login redirect params (which also use ?redirect=).
    if (redirectParam && storedPath) {
      params.delete("redirect");
      const remaining = params.toString();
      sessionStorage.removeItem(STORAGE_KEY_GH_PAGES_REDIRECT);
      navigate(
        `${redirectParam}${
          remaining ? `?${remaining}` : ""
        }${location.hash}`,
        { replace: true }
      );
      return;
    }

    // Handle case where sessionStorage is set but no redirect param
    // (e.g., if user navigated away and back)
    if (storedPath && location.pathname === ROUTES.HOME) {
      sessionStorage.removeItem(STORAGE_KEY_GH_PAGES_REDIRECT);
      navigate(storedPath, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
}

function CapacityWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { capacityReached } = useAuth();

  useEffect(() => {
    if (capacityReached && location.pathname !== ROUTES.CAPACITY) {
      navigate(ROUTES.CAPACITY, { replace: true });
    }
  }, [capacityReached, location.pathname, navigate]);

  return null;
}
