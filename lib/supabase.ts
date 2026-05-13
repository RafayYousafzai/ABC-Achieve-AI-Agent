import { createClient } from "@supabase/supabase-js";

// Using the standard REST client which works perfectly on Vercel Edge
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS so the Edge API can write freely
);
