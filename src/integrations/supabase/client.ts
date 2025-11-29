import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uunujmdvognpfdrzkcnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bnVqbWR2b2ducGZkcnprY25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjc2NDgsImexZCI6MjA3OTg0MzY0OH0.BhYUZSeqrlujsVInE4aNooUv2PVaNYqarOTcQZWFprc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);