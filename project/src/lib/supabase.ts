import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas. ' +
    'La autenticación usará modo demo (mock) hasta que configures el .env.'
  );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

/** Verdadero solo cuando las env vars están correctamente configuradas. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
