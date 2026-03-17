import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const checkRoles = async (userId: string) => {
    try {
      const [adminResult, staffResult] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "staff" as any }),
      ]);

      if (adminResult.error) console.error("[Auth] Admin check error:", adminResult.error);
      if (staffResult.error) console.error("[Auth] Staff check error:", staffResult.error);

      setIsAdmin(!!adminResult.data);
      setIsStaff(!!staffResult.data);
    } catch (error) {
      console.error("[Auth] Role check error:", error);
      setIsAdmin(false);
      setIsStaff(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await checkAdminRole(nextSession.user.id);
      } else {
        setIsAdmin(false);
      }

      if (isMounted) setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        void applySession(session);
      })
      .catch((error) => {
        console.error("[Auth] Failed to get session:", error);
        if (!isMounted) return;
        setLoading(false);
        setIsAdmin(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check rate limit before attempting sign in
    try {
      const { data: allowed, error: rlError } = await supabase.rpc("check_rate_limit" as any, {
        p_identifier: email.toLowerCase().trim(),
      });
      if (rlError) {
        console.error("[Auth] Rate limit check failed:", rlError);
      } else if (!allowed) {
        return { error: new Error("Too many login attempts. Please wait 15 minutes and try again.") };
      }
    } catch (e) {
      console.error("[Auth] Rate limit error:", e);
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
