import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function useUser() {
  const supabase = createClient();
  const { user: storeUser, initialized, setUser, setSession, setInitialized } = useAuthStore();

  useEffect(() => {
    if (initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, initialized, setSession, setUser, setInitialized]);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: initialized, // Only fetch after auth state is initialized
  });

  return {
    user: storeUser || user || null,
    loading: isLoading || !initialized,
    error,
  };
}

