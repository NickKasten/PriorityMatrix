import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabaseClient } from "~/lib/supabase.client";
import { useAuth } from "~/lib/auth-context";
import {
  getErrorMessage,
  ROUTES,
  RPC_FUNCTIONS,
  STORAGE_KEY_CAPACITY_ERROR,
  STORAGE_KEY_POST_AUTH_REDIRECT,
} from "~/lib/constants";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { markCapacityReached, signingOut } = useAuth();
  const [status, setStatus] = useState("Verifying your magic link…");

  // Don't process callback during sign out
  if (signingOut) {
    return null;
  }

  useEffect(() => {
    const processCallback = async () => {
      const hash = window.location.hash.substring(1);

      if (!hash) {
        setStatus("Invalid callback URL.");
        return;
      }

      const { error: exchangeError } =
        await supabaseClient.auth.exchangeCodeForSession(hash);

      if (exchangeError) {
        setStatus(getErrorMessage(exchangeError.message));
        return;
      }

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

      if (userError || !userData?.user?.id || !userData.user.email) {
        setStatus("Unable to retrieve user details.");
        return;
      }

      const { error: capacityError } = await supabaseClient.rpc(
        RPC_FUNCTIONS.ENSURE_USER_SLOT,
        {
          user_uuid: userData.user.id,
          user_email: userData.user.email,
        }
      );

      if (capacityError) {
        markCapacityReached();
        sessionStorage.setItem(
          STORAGE_KEY_CAPACITY_ERROR,
          getErrorMessage(capacityError.message)
        );
        await supabaseClient.auth.signOut();
        navigate(ROUTES.CAPACITY, { replace: true });
        return;
      }

      const target =
        sessionStorage.getItem(STORAGE_KEY_POST_AUTH_REDIRECT) || ROUTES.TODOS;
      sessionStorage.removeItem(STORAGE_KEY_POST_AUTH_REDIRECT);
      navigate(target, { replace: true });
    };

    void processCallback();
  }, [markCapacityReached, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-hard px-10 py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        <p className="text-lg font-medium text-center text-gray-700 dark:text-gray-200">
          {status}
        </p>
      </div>
    </div>
  );
}
