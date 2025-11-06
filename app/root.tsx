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
      <AccountMenu />
      <GitHubPagesRedirect />
      <CapacityWatcher />
      <Outlet />
    </AuthProvider>
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
    const storedPath = sessionStorage.getItem("gh-pages-redirect");

    if (redirectParam) {
      params.delete("redirect");
      const remaining = params.toString();
      sessionStorage.removeItem("gh-pages-redirect");
      navigate(
        `${redirectParam}${
          remaining ? `?${remaining}` : ""
        }${location.hash}`,
        { replace: true }
      );
      return;
    }

    if (storedPath && location.pathname === "/") {
      sessionStorage.removeItem("gh-pages-redirect");
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
    if (capacityReached && location.pathname !== "/capacity") {
      navigate("/capacity", { replace: true });
    }
  }, [capacityReached, location.pathname, navigate]);

  return null;
}
