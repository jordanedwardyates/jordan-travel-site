import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for public data.
 *
 * Unlike the client in server.ts, this one never touches cookies(), so
 * Server Components using it stay statically renderable (ISR). All access
 * runs as the anon role and is gated by Row Level Security.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
