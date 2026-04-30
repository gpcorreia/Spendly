import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
const supabaseKey: string | undefined = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Supabase env variables not set");
}

const supabase: SupabaseClient = createClient(supabaseUrl || '', supabaseKey || '');

export default supabase;
