import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Returns null when env vars are not configured — app works offline without it
export function getSupabaseClient(): SupabaseClient | null {
  if (!url || !key || url === 'your-project-url-here') return null;
  return createClient(url, key);
}

export const supabase = getSupabaseClient();
