//import { createClient } from '@supabase/supabase-js';
//import { config } from './index.js';
//
//if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
 // throw new Error(
 //   'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
 // );
//}

//export const supabase = createClient(
//  config.supabaseUrl,
 // config.supabaseServiceRoleKey
//);
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index.js';

export let supabase: SupabaseClient | null = null;

// Log the Supabase configuration values for debugging (avoid logging sensitive keys in production)
console.log("SUPABASE_URL:", config.supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!config.supabaseServiceRoleKey);

if (config.supabaseUrl && config.supabaseServiceRoleKey) {
  supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
}