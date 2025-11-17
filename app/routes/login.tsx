import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { supabaseClient } from "~/lib/supabase.client";
import { useAuth } from "~/lib/auth-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { markCapacityReached, user, initializing, signingOut } = useAuth();

  // Let global LoadingOverlay handle transition states
  if (initializing || signingOut) {
    return null;
  }

  if (user) {
    const redirect = searchParams.get("redirect") ?? "/todos";
    return <Navigate to={redirect} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    const { data: capacityRaw, error: capacityError } =
      await supabaseClient.rpc("check_user_capacity", {
        email_input: trimmedEmail,
      });

    if (capacityError) {
      setError(capacityError.message);
      return;
    }

    const capacityData = Array.isArray(capacityRaw)
      ? capacityRaw[0]
      : capacityRaw;

    if (
      capacityData?.capacity_reached &&
      !capacityData?.is_existing_user
    ) {
      markCapacityReached();
      navigate("/capacity");
      return;
    }

    const baseUrl = new URL(import.meta.env.BASE_URL || "/", window.location.origin);
    baseUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/auth/callback`;

    const { error: signInError } = await supabaseClient.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: baseUrl.toString(),
      },
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const redirect = searchParams.get("redirect") ?? "/todos";
    sessionStorage.setItem("post-auth-redirect", redirect);
    setStatus("Success! Check your email for a login link.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-hard p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Enter your email to receive a secure magic link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
          >
            Send Magic Link
          </button>
        </form>
        {status && (
          <div className="p-4 bg-success-100 text-success-600 rounded-lg">
            {status}
          </div>
        )}
        {error && (
          <div className="p-4 bg-error-100 text-error-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
