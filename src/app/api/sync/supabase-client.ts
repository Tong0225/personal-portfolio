// This file should only be used in server-side code (API routes)
// Do not import this in client components!

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase credentials. Please set COZE_SUPABASE_URL and COZE_SUPABASE_ANON_KEY environment variables.');
  }

  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
}
