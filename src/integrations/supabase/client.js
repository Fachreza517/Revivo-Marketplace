import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Peringatan: Kredensial URL atau Anon Key Supabase belum terdeteksi di file .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);