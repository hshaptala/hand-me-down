import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a singleton instance for client-side
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
};

// For server components
export const createServerSupabase = () => {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user;
};

export default supabase;
