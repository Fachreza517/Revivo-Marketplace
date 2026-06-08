import { createClient } from '@supabase/supabase-js'

// 1. Ambil URL database secara fleksibel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyz-id-database-kamu.supabase.co';

// 2. Ambil Kunci Anon secara cerdas (mencegah salah nama variabel di dashboard Vercel)
const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...'; // 👈 Opsional: Taruh salinan string anon key aslimu di sini sebagai cadangan darurat

// 3. Sensor validasi internal sistem siber REVIVO
if (!supabaseUrl || supabaseUrl.includes('xyz-id-database-kamu') || !supabaseAnonKey || supabaseAnonKey.includes('eyJ...')) {
  console.warn("Peringatan: Kredensial URL atau Anon Key Supabase belum terdeteksi secara live di file .env atau panel hosting.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);