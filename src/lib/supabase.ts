import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://iqfrzsxoueumotvtpyxy.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZnJ6c3hvdWV1bW90dnRweXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MjIxNjQsImV4cCI6MjEwNTk5ODE2NH0.b94i4KVfquTaKG0ciYx9RNOtnSWIIwbm2r89slUllGQ';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

export const supabase = createClient(
  supabaseUrl && !supabaseUrl.includes('placeholder') ? supabaseUrl : defaultUrl,
  supabaseAnonKey && !supabaseAnonKey.includes('placeholder') ? supabaseAnonKey : defaultKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
