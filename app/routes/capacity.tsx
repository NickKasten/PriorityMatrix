import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/lib/auth-context";

export default function CapacityReached() {
  const { markCapacityReached } = useAuth();
  const [message, setMessage] = useState(
    "Thanks for your interest! PriorityMatrix is currently at maximum capacity."
  );

  useEffect(() => {
    markCapacityReached();
    const stored = sessionStorage.getItem("capacity-error");
    if (stored) {
      setMessage(stored);
      sessionStorage.removeItem("capacity-error");
    }
  }, [markCapacityReached]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-hard px-10 py-12 text-center space-y-6">
        <h1 className="text-4xl font-black text-error-600">Capacity Reached</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          {message}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We maintain a strict 100 user limit to guarantee reliability for our
          existing users. Please check back later or contact support if you
          believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:support@prioritymatrix.app"
            className="px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
          >
            Contact Support
          </a>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Try Again Later
          </Link>
        </div>
      </div>
    </div>
  );
}
