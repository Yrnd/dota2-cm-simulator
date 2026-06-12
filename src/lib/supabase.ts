let supabaseClient: any = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) return null;

  // Dynamic import to avoid bundling supabase when not configured
  return import('@supabase/supabase-js').then(({ createClient }) => {
    supabaseClient = createClient(url, key);
    return supabaseClient;
  });
}

export const isOnline = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return !!(url && key);
};

// Synchronous getter for non-async code paths — returns null if not yet loaded
export const supabase = null as any;
