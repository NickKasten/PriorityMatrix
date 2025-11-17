import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseClient } from "./supabase.client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  signingOut: boolean;
  transitioning: boolean;
  capacityReached: boolean;
  markCapacityReached(): void;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [capacityReached, setCapacityReached] = useState(false);

  useEffect(() => {
    let transitionTimer: NodeJS.Timeout | null = null;

    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      // Set transitioning flag when auth state changes
      setTransitioning(true);

      // Clear any existing transition timer
      if (transitionTimer) {
        clearTimeout(transitionTimer);
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);

      // Clear signing out flag when session changes with a small delay
      // to ensure smooth transition without flashing
      if (!newSession) {
        setTimeout(() => {
          setSigningOut(false);
        }, 300);
      }

      // Clear transitioning flag after a delay to prevent flashing
      // This ensures the UI stabilizes before allowing redirects
      transitionTimer = setTimeout(() => {
        setTransitioning(false);
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
      if (transitionTimer) {
        clearTimeout(transitionTimer);
      }
    };
  }, []);

  const signOut = async () => {
    setSigningOut(true);
    await supabaseClient.auth.signOut();
    // signingOut will be set to false by onAuthStateChange when session clears
  };

  const value = useMemo(
    () => ({
      user,
      session,
      initializing,
      signingOut,
      transitioning,
      capacityReached,
      markCapacityReached: () => setCapacityReached(true),
      signOut,
    }),
    [user, session, initializing, signingOut, transitioning, capacityReached]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
