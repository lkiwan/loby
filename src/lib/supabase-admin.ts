import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This client should only be used in server-side code (API routes, Server Actions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
