import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const ensuringRef = useRef(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setLoading(false);
        return;
      }
      // No session yet → sign in anonymously so RLS works.
      if (!ensuringRef.current) {
        ensuringRef.current = true;
        const { data: anon, error } = await supabase.auth.signInAnonymously();
        if (error) console.error("anon sign-in failed", error);
        setSession(anon.session ?? null);
        setUser(anon.user ?? null);
        setLoading(false);
      }
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ user, session, loading }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}