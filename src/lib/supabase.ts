import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/config";

let adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Creates a Supabase admin client using the service role key.
 * This should only be used server-side for operations that require elevated permissions.
 */
export function getSupabaseAdmin() {
  if (!adminClient) {
    const env = getEnv();
    adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return adminClient;
}

/**
 * Creates a Supabase client for client-side operations with user authentication.
 */
export function getSupabaseClient() {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
