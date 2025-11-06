import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabaseClient } from "~/lib/supabase.client";
import { useAuth } from "~/lib/auth-context";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { markCapacityReached } = useAuth();
  const [status, setStatus] = useState("Verifying your magic link…");

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
        setStatus(exchangeError.message);
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
        "ensure_user_slot",
        {
          user_uuid: userData.user.id,
          user_email: userData.user.email,
        }
      );

      if (capacityError) {
        markCapacityReached();
        sessionStorage.setItem(
          "capacity-error",
          capacityError.message || "User capacity reached."
        );
        await supabaseClient.auth.signOut();
        navigate("/capacity", { replace: true });
        return;
      }

      const target =
        sessionStorage.getItem("post-auth-redirect") || "/todos";
      sessionStorage.removeItem("post-auth-redirect");
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
